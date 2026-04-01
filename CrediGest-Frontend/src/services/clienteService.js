import api from "./api";

const clienteService = {
  listar: () => api.get("/clientes"),

  obterPorId: (id) => api.get(`/clientes/${id}`),

  criar: (clienteData) => api.post("/clientes", clienteData),

  editar: (id, clienteData) => api.patch(`/clientes/${id}`, clienteData),

  deletar: (id) => api.delete(`/clientes/${id}`),

  obterSaldo: (id) => api.get(`/clientes/${id}/saldo`),
};

export default clienteService;
