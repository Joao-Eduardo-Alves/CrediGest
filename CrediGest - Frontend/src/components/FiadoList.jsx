import React, { useState, useEffect } from "react";
import fiadoService from "../services/fiadoService";
import "./FiadoList.css";

function FiadoList() {
  const [fiados, setFiados] = useState({});
  const [pagamentos, setPagamentos] = useState({});
  const [exibirClientes, setExibirClientes] = useState({});
  const [exibirFiados, setExibirFiados] = useState({});
  const [novoItem, setNovoItem] = useState({});
  const [editando, setEditando] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saldos, setSaldos] = useState({});
  const [modalItemAberto, setModalItemAberto] = useState(null);

  useEffect(() => {
    carregarFiados();
  }, []);

  useEffect(() => {
    const carregarSaldos = async () => {
      const novosSaldos = {};
      for (const clienteId of Object.keys(fiados)) {
        const saldo = await fiadoService.obterSaldo(clienteId);
        novosSaldos[clienteId] = saldo;
      }
      setSaldos(novosSaldos);
    };

    if (Object.keys(fiados).length) {
      carregarSaldos();
    }
  }, [fiados]);

  const carregarFiados = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fiadoService.listarTodos();
      const grouped = data.reduce((acc, f) => {
        if (!acc[f.clienteId]) acc[f.clienteId] = [];
        acc[f.clienteId].push(f);
        return acc;
      }, {});
      setFiados(grouped);

      // Carregar pagamentos
      const novosPagamentos = {};
      for (const clienteId of Object.keys(grouped)) {
        try {
          const lista = await fiadoService.listarPagamentos(clienteId);
          novosPagamentos[clienteId] = lista;
        } catch (err) {
          console.error(
            "Erro ao carregar pagamentos do cliente",
            clienteId,
            err,
          );
        }
      }
      setPagamentos(novosPagamentos);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar fiados");
    } finally {
      setLoading(false);
    }
  };

  const toggleCliente = (clienteId) => {
    setExibirClientes((p) => ({ ...p, [clienteId]: !p[clienteId] }));
  };

  const toggleFiado = (fiadoId) => {
    setExibirFiados((p) => ({ ...p, [fiadoId]: !p[fiadoId] }));
  };

  const handleDeleteFiado = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este fiado?")) return;
    try {
      await fiadoService.deletar(id);
      carregarFiados();
    } catch (err) {
      console.error(err);
      setError("Erro ao deletar fiado");
    }
  };

  const handleAddItem = async (fiadoId) => {
    const item = novoItem[fiadoId];
    if (!item || !item.nome || item.quantidade <= 0 || item.valor <= 0) {
      alert("Preencha todos os campos corretamente");
      return;
    }
    try {
      await fiadoService.adicionarItens(fiadoId, [
        {
          nomeProduto: item.nome,
          quantidade: item.quantidade,
          valorProduto: item.valor,
        },
      ]);
      setNovoItem((p) => ({
        ...p,
        [fiadoId]: { nome: "", quantidade: 1, valor: 0 },
      }));
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar item");
    }
  };

  const startEditItem = (fiadoId, item) => {
    setEditando((p) => ({
      ...p,
      [item.id]: {
        fiadoId,
        nome: item.nomeProduto,
        quantidade: item.quantidade,
        valor: item.valorProduto,
      },
    }));
  };

  const cancelEditItem = (itemId) => {
    setEditando((p) => {
      const novo = { ...p };
      delete novo[itemId];
      return novo;
    });
  };

  const saveEditItem = async (itemId) => {
    const dados = editando[itemId];
    if (!dados || !dados.nome || dados.quantidade <= 0 || dados.valor <= 0) {
      alert("Preencha todos os campos para salvar");
      return;
    }
    try {
      await fiadoService.editarItem(dados.fiadoId, itemId, {
        nomeProduto: dados.nome,
        quantidade: dados.quantidade,
        valorProduto: dados.valor,
      });
      cancelEditItem(itemId);
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar item");
    }
  };

  const deleteFiado = async (fiadoId) => {
    if (!window.confirm("Deletar esse fiado?")) return;
    try {
      await fiadoService.deletar(fiadoId);
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar fiado");
    }
  };

  const removeItem = async (fiadoId, itemId) => {
    if (!window.confirm("Remover esse item?")) return;
    try {
      await fiadoService.removerItem(fiadoId, itemId);
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover item");
    }
  };

  const handlePagar = async (clienteId) => {
    try {
      const saldo = saldos[clienteId];
      let valor;

      if (saldo > 0) {
        valor = prompt(
          `O cliente deve: R$ ${saldo.toFixed(2)}\nDigite o valor do pagamento:`,
        );
      } else if (saldo < 0) {
        valor = prompt(
          `O cliente tem: R$ ${Math.abs(saldo).toFixed(2)} de crédito\nDigite o valor do pagamento:`,
        );
      } else {
        valor = prompt("Digite o valor do pagamento:");
      }

      if (!valor || isNaN(valor) || Number(valor) <= 0) {
        alert("Valor inválido");
        return;
      }

      await fiadoService.registrarPagamento(clienteId, {
        valorPago: Number(valor),
      });
      alert("Pagamento registrado!");
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pagamento");
    }
  };

  const gerarExtratoCliente = (clienteId) => {
    const listaFiados = fiados[clienteId] || [];
    const listaPagamentos = pagamentos[clienteId] || [];

    const eventos = [
      ...listaFiados.map((f) => ({ ...f, tipo: "fiado" })),
      ...listaPagamentos.map((p) => ({ ...p, tipo: "pagamento" })),
    ];

    eventos.sort((a, b) => new Date(a.data) - new Date(b.data));

    return eventos;
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="fiado-list">
      <h2>Fiados</h2>
      <button
        className="btn-novo"
        onClick={() => (window.location.href = "/fiados/novo")}
      >
        + Novo Fiado
      </button>

      {Object.keys(fiados).length === 0 ? (
        <p>Nenhum fiado encontrado</p>
      ) : (
        <table>
          <tbody>
            {Object.keys(fiados).map((clienteId) => {
              const extrato = gerarExtratoCliente(clienteId);
              return (
                <React.Fragment key={clienteId}>
                  <tr
                    className="cliente-row"
                    onClick={() => toggleCliente(clienteId)}
                  >
                    <td colSpan="4">
                      <span className="seta">
                        {exibirClientes[clienteId] ? "▼" : "▶"}
                      </span>{" "}
                      Cliente: {clienteId} Valor Total: R${" "}
                      {saldos[clienteId]?.toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => handlePagar(clienteId)}
                        className="btn-pagar"
                      >
                        Pagar
                      </button>
                    </td>
                  </tr>

                  {exibirClientes[clienteId] && (
                    <tr className="fiado-container">
                      <td colSpan="6">
                        <table className="fiados-cliente">
                          <thead>
                            <tr className="info-header">
                              <th> </th>
                              <th>Data</th>
                              <th>Tipo</th>
                              <th>Observação</th>
                              <th>Qtde Itens</th>
                              <th>Valor</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {extrato.map((e) => (
                              <React.Fragment
                                key={e.id || `${e.tipo}-${e.data}`}
                              >
                                <tr
                                  className={
                                    e.tipo === "pagamento"
                                      ? "pagamento-row"
                                      : "fiado-row"
                                  }
                                >
                                  <td>
                                    {e.tipo === "fiado" && (
                                      <button
                                        onClick={(ev) => {
                                          ev.stopPropagation();
                                          toggleFiado(e.id);
                                        }}
                                      >
                                        {exibirFiados[e.id] ? "▼" : "▶"}
                                      </button>
                                    )}
                                  </td>
                                  <td>{new Date(e.data).toLocaleString()}</td>

                                  <td>
                                    {e.tipo === "fiado" ? "Fiado" : "Pagamento"}
                                  </td>

                                  <td>
                                    {e.tipo === "fiado" ? e.observacao : "-"}
                                  </td>

                                  <td>
                                    {e.tipo === "fiado" ? e.itens.length : "-"}
                                  </td>

                                  <td>
                                    R${" "}
                                    {e.tipo === "fiado"
                                      ? e.valorTotal.toFixed(2)
                                      : e.valorPago.toFixed(2)}
                                  </td>

                                  <td>
                                    <button
                                      onClick={() => {
                                        if (e.tipo === "fiado") {
                                          deleteFiado(e.id);
                                        }
                                      }}
                                    >
                                      X
                                    </button>

                                    <button> Editar </button>
                                  </td>
                                </tr>

                                {/* Itens do fiado */}
                                {e.tipo === "fiado" && exibirFiados[e.id] && (
                                  <tr>
                                    <td colSpan="7">
                                      <table className="itens-table">
                                        <thead>
                                          <tr className="info-header">
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                            <th>Valor</th>
                                            <th>Subtotal</th>
                                            <th>Ações</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {e.itens.map((item) => (
                                            <tr
                                              key={item.id}
                                              className="item-row"
                                            >
                                              {editando[item.id] ? (
                                                <>
                                                  <td>
                                                    <input
                                                      value={
                                                        editando[item.id].nome
                                                      }
                                                      onChange={(ev) =>
                                                        setEditando((p) => ({
                                                          ...p,
                                                          [item.id]: {
                                                            ...p[item.id],
                                                            nome: ev.target
                                                              .value,
                                                          },
                                                        }))
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="number"
                                                      value={
                                                        editando[item.id]
                                                          .quantidade
                                                      }
                                                      onChange={(ev) =>
                                                        setEditando((p) => ({
                                                          ...p,
                                                          [item.id]: {
                                                            ...p[item.id],
                                                            quantidade: Number(
                                                              ev.target.value,
                                                            ),
                                                          },
                                                        }))
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      value={
                                                        editando[item.id].valor
                                                      }
                                                      onChange={(ev) =>
                                                        setEditando((p) => ({
                                                          ...p,
                                                          [item.id]: {
                                                            ...p[item.id],
                                                            valor: Number(
                                                              ev.target.value,
                                                            ),
                                                          },
                                                        }))
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <button
                                                      onClick={() =>
                                                        saveEditItem(item.id)
                                                      }
                                                    >
                                                      Salvar
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        cancelEditItem(item.id)
                                                      }
                                                    >
                                                      Cancelar
                                                    </button>
                                                  </td>
                                                </>
                                              ) : (
                                                <>
                                                  <td>{item.nomeProduto}</td>
                                                  <td>{item.quantidade}</td>
                                                  <td>
                                                    R$
                                                    {item.valorProduto.toFixed(
                                                      2,
                                                    )}
                                                  </td>
                                                  <td>
                                                    R$
                                                    {(
                                                      item.valorProduto *
                                                      item.quantidade
                                                    ).toFixed(2)}
                                                  </td>
                                                  <td>
                                                    <button
                                                      onClick={() =>
                                                        removeItem(
                                                          e.id,
                                                          item.id,
                                                        )
                                                      }
                                                    >
                                                      X
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        startEditItem(
                                                          e.id,
                                                          item,
                                                        )
                                                      }
                                                    >
                                                      Editar
                                                    </button>
                                                  </td>
                                                </>
                                              )}
                                            </tr>
                                          ))}

                                          {/* Novo item */}
                                          <tr>
                                            <td>
                                              <button
                                                onClick={() =>
                                                  setModalItemAberto(e.id)
                                                }
                                              >
                                                + Adicionar Item
                                              </button>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
      {modalItemAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Novo Item</h3>

            <input
              placeholder="Produto"
              value={novoItem[modalItemAberto]?.nome || ""}
              onChange={(e) =>
                setNovoItem((p) => ({
                  ...p,
                  [modalItemAberto]: {
                    ...p[modalItemAberto],
                    nome: e.target.value,
                  },
                }))
              }
            />

            <input
              type="number"
              placeholder="Quantidade"
              value={novoItem[modalItemAberto]?.quantidade || 1}
              onChange={(e) =>
                setNovoItem((p) => ({
                  ...p,
                  [modalItemAberto]: {
                    ...p[modalItemAberto],
                    quantidade: Number(e.target.value),
                  },
                }))
              }
            />

            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={novoItem[modalItemAberto]?.valor || 0}
              onChange={(e) =>
                setNovoItem((p) => ({
                  ...p,
                  [modalItemAberto]: {
                    ...p[modalItemAberto],
                    valor: Number(e.target.value),
                  },
                }))
              }
            />

            <div className="modal-actions">
              <button
                onClick={() => {
                  handleAddItem(modalItemAberto);
                  setModalItemAberto(null);
                }}
              >
                Salvar
              </button>

              <button onClick={() => setModalItemAberto(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FiadoList;
