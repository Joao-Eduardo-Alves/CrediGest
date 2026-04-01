import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clienteService from "../services/clienteService";
import "./ClienteForm.css";

import toast from "../utils/toast";

function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    observacao: "",
  });

  useEffect(() => {
    if (id) {
      carregarClienteParaEditar();
    }
  }, [id]);

  const carregarClienteParaEditar = async () => {
    setLoading(true);
    try {
      const data = await clienteService.obterPorId(id);
      setFormData(data);
    } catch (err) {
      setError("Erro ao carregar cliente");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || formData.nome.trim() === "") {
      toast.error("O nome do cliente é obrigatório");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (id) {
        await clienteService.editar(id, formData);
      } else {
        await clienteService.criar(formData);
      }
      navigate("/clientes");
    } catch (err) {
      setError(err.message || "Erro ao salvar cliente");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cliente-form">
      <h2>{id ? "Editar Cliente" : "Novo Cliente"}</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome do cliente"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            maxLength={11}
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="observacao">Observação</label>
          <input
            type="text"
            id="observacao"
            name="observacao"
            value={formData.observacao}
            onChange={handleChange}
            placeholder="Observações sobre o cliente"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-salvar" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/clientes")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClienteForm;
