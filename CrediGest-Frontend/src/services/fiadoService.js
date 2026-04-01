import api from "./api";

const fiadoService = {
  listar: () => api.get("/fiados"),

  obterPorId: (id) => api.get(`/fiados/${id}`),

  criar: (fiadoData) => api.post("/fiados", fiadoData),

  editar: (id, fiadoData) => api.patch(`/fiados/${id}`, fiadoData),

  deletar: (id) => api.delete(`/fiados/${id}`),

  adicionarItens: (fiadoId, itens) =>
    api.post(`/fiados/${fiadoId}/itens`, itens),

  editarItem: (fiadoId, itemId, itemData) =>
    api.patch(`/fiados/${fiadoId}/itens/${itemId}`, itemData),

  removerItem: (fiadoId, itemId) =>
    api.delete(`/fiados/${fiadoId}/itens/${itemId}`),

  obterSaldo: (clienteId) => api.get(`/clientes/${clienteId}/saldo`),

  // pagamentos

  registrarPagamento: (clienteId, pagamentoData) =>
    api.post(`/pagamentos/registrar/${clienteId}`, pagamentoData),

  excluirPagamento: (pagamentoId) =>
    api.delete(`/pagamentos/excluir/${pagamentoId}`),

  listarPagamentos: (clienteId) =>
    api.get(`/pagamentos/historico/${clienteId}`),

  editarPagamento: (pagamentoId, pagamentoData) =>
    api.patch(`/pagamentos/editar/${pagamentoId}`, pagamentoData),
};

export default fiadoService;
