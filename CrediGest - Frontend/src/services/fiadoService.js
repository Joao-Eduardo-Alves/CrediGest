import api from "./api";

const fiadoService = {
  listarTodos: () => api.get("/fiados"),

  criar: (fiadoData) => api.post("/fiados", fiadoData),

  obterPorId: (id) => api.get(`/fiados/${id}`),

  deletar: (id) => api.delete(`/fiados/${id}`),

  adicionarItens: (fiadoId, itens) =>
    api.post(`/fiados/${fiadoId}/itens`, itens),

  editarItem: (fiadoId, itemId, itemData) =>
    api.patch(`/fiados/${fiadoId}/itens/${itemId}`, itemData),

  removerItem: (fiadoId, itemId) =>
    api.delete(`/fiados/${fiadoId}/itens/${itemId}`),

  obterSaldo: (clienteId) => api.get(`/clientes/${clienteId}/saldo`),

  registrarPagamento: (clienteId, pagamentoData) =>
    api.post(`/pagamentos/registrar/${clienteId}`, pagamentoData),

  listarPagamentos: (clienteId) =>
    api.get(`/pagamentos/historico/${clienteId}`),
};

export default fiadoService;
