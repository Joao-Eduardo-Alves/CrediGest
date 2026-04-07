import React, { useState, useEffect } from "react";
import clienteService from "../services/clienteService";
import fiadoService from "../services/fiadoService";
import WhatsAppButton from "./WhatsAppButton";
import { EditIcon, DeleteIcon } from "./Icons";

import toast from "../utils/toast";

import "./ClienteList.css";

function ClienteList() {
  const [clientes, setClientes] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    const carregarSaldos = async () => {
      const novosSaldos = {};
      for (const cliente of clientes) {
        try {
          const saldo = await clienteService.obterSaldo(cliente.id);
          novosSaldos[cliente.id] = saldo ?? 0;
        } catch (err) {
          console.error(`Erro ao buscar saldo do cliente ${cliente.id}`, err);
          novosSaldos[cliente.id] = 0;
        }
      }
      setSaldos(novosSaldos);
    };

    if (clientes.length) {
      carregarSaldos();
    }
  }, [clientes]);

  const carregarClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.listar();
      setClientes(data);
    } catch (err) {
      setError("Erro ao carregar clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      try {
        const fiados = await fiadoService.listar();
        const fiadosDoCliente = fiados.filter((f) => f.clienteId === id);

        const pagamentos = await fiadoService.listarPagamentos(id);

        if (fiadosDoCliente.length > 0 || pagamentos.length > 0) {
          toast.error(
            "Não é possível deletar este cliente. Ele possui fiados ou pagamentos registrados.",
          );
          return;
        }

        await clienteService.deletar(id);
        setClientes(clientes.filter((c) => c.id !== id));
        toast.success("Cliente deletado com sucesso");
      } catch (err) {
        setError("Erro ao deletar cliente");
        console.error(err);
      }
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="cliente-list">
      <h2>Clientes</h2>
      <button
        className="btn-novo"
        onClick={() => (window.location.href = "/clientes/novo")}
      >
        + Novo Cliente
      </button>

      {clientes.length === 0 ? (
        <p>Nenhum cliente encontrado</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Observações</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.observacao}</td>
                <td>
                  <div className="acoes">
                    <WhatsAppButton
                      telefone={cliente.telefone}
                      nome={cliente.nome}
                      valor={saldos[cliente.id]?.toFixed(2) ?? "0.00"}
                    />
                    <button
                      className="btn-editar"
                      onClick={() =>
                        (window.location.href = `/clientes/${cliente.id}`)
                      }
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="btn-deletar"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClienteList;
