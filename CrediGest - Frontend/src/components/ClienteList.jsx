import React, { useState, useEffect } from "react";
import clienteService from "../services/clienteService";
import "./ClienteList.css";

function ClienteList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.listarTodos();
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
        await clienteService.deletar(id);
        setClientes(clientes.filter((c) => c.id !== id));
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
              <th>Ações</th>
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
                  <button
                    className="btn-editar"
                    onClick={() =>
                      (window.location.href = `/clientes/${cliente.id}`)
                    }
                  >
                    Editar
                  </button>
                  <button
                    className="btn-deletar"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    Deletar
                  </button>
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
