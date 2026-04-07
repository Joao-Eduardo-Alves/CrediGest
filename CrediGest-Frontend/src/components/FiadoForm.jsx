import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import fiadoService from "../services/fiadoService";
import clienteService from "../services/clienteService";
import { DeleteIcon } from "./Icons";

import toast from "../utils/toast";

import "./FiadoForm.css";

function FiadoForm() {
  const getDataLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    data: getDataLocal(),
    clienteId: "",
    itens: [],
    observacao: "",
    valorTotal: 0,
  });
  const [novoItem, setNovoItem] = useState({
    nomeProduto: "",
    valorProduto: "",
    quantidade: "1",
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const data = await clienteService.listar();
      setClientes(data);
    } catch (err) {
      setError("Erro ao carregar clientes");
      console.error(err);
    }
  };

  const handleChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeNovoItem = (e) => {
    const { name, value } = e.target;
    setNovoItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const adicionarItem = () => {
    if (
      !novoItem.nomeProduto ||
      !novoItem.valorProduto ||
      !novoItem.quantidade
    ) {
      toast.error("Preencha todos os campos do item");
      return;
    }

    const item = {
      nomeProduto: novoItem.nomeProduto,
      valorProduto: parseFloat(novoItem.valorProduto) || 0,
      quantidade: parseFloat(novoItem.quantidade) || 1,
    };

    setFormData((prev) => ({
      ...prev,
      itens: [...prev.itens, item],
    }));

    setNovoItem({
      nomeProduto: "",
      valorProduto: "",
      quantidade: "1",
    });
  };
  const total = formData.itens.reduce((acc, item) => {
    return acc + item.valorProduto * item.quantidade;
  }, 0);

  const removerItem = (index) => {
    const confirmacao = window.confirm(
      "Tem certeza que deseja remover este item do fiado?",
    );
    if (!confirmacao) return;

    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clienteId) {
      toast.error("Selecione um cliente antes de salvar o fiado");
      return;
    }

    if (!formData.itens || formData.itens.length === 0) {
      toast.error("Adicione pelo menos um item antes de salvar o fiado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dados = {
        clienteId: parseInt(formData.clienteId),
        data: formData.data,
        itens: formData.itens,
        observacao: formData.observacao,
      };

      if (id) {
        await fiadoService.editarItem(id, dados);
      } else {
        await fiadoService.criar(dados);
      }

      navigate("/fiados");
    } catch (err) {
      setError(err.message || "Erro ao salvar fiado");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fiado-form">
      <h2>{id ? "Editar Fiado" : "Novo Fiado"}</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Dados do Fiado</h3>

          <div className="form-group">
            <label htmlFor="clienteId">Cliente *</label>
            <select
              id="clienteId"
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChangeFormData}
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="data">Data *</label>
            <input
              type="datetime-local"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChangeFormData}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="observacao">Observação</label>
            <input
              type="String"
              id="observacao"
              name="observacao"
              value={formData.observacao}
              onChange={handleChangeFormData}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Adicionar Itens</h3>

          <div className="item-input-group">
            <div className="form-group">
              <label htmlFor="nomeProduto">Produto *</label>
              <input
                type="text"
                id="nomeProduto"
                name="nomeProduto"
                value={novoItem.nomeProduto}
                onChange={handleChangeNovoItem}
                placeholder="Nome do produto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="valorProduto">Valor (R$) *</label>
              <input
                type="number"
                id="valorProduto"
                name="valorProduto"
                value={novoItem.valorProduto}
                onChange={handleChangeNovoItem}
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade *</label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                value={novoItem.quantidade}
                onChange={handleChangeNovoItem}
                min="1"
                placeholder="1"
              />
            </div>

            <button
              type="button"
              className="btn-adicionar"
              onClick={adicionarItem}
            >
              + Adicionar
            </button>
          </div>

          {formData.itens.length > 0 && (
            <div className="items-table">
              <h4>Itens do Fiado</h4>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Valor</th>
                    <th>Quantidade</th>
                    <th>Subtotal</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.itens.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nomeProduto}</td>
                      <td>R$ {item.valorProduto.toFixed(2)}</td>
                      <td>{item.quantidade}</td>
                      <td>
                        R$ {(item.valorProduto * item.quantidade).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-deletar"
                          onClick={() => removerItem(index)}
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total">
                <strong>Total: R$ {total.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-salvar" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Fiado"}
          </button>
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/fiados")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default FiadoForm;
