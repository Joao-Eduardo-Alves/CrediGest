import React, { useState, useEffect } from "react";
import fiadoService from "../services/fiadoService";
import { EditIcon, DeleteIcon, PayIcon } from "./Icons";
import "./FiadoList.css";

function FiadoList() {
  const [fiados, setFiados] = useState({});
  const [pagamentos, setPagamentos] = useState({});
  const [exibirFiados, setExibirFiados] = useState({}); //exibirFiados
  const [exibirItens, setExibirItens] = useState({}); //exibirItens
  const [novoItem, setNovoItem] = useState({});
  const [editandoItem, setEditandoItem] = useState({});
  const [editandoFiado, setEditandoFiado] = useState({});
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

  const toggleFiados = (clienteId) => {
    setExibirFiados((p) => ({ ...p, [clienteId]: !p[clienteId] }));
  };

  const toggleItens = (fiadoId) => {
    setExibirItens((p) => ({ ...p, [fiadoId]: !p[fiadoId] }));
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

  const removeItem = async (fiadoId, itemId, itens) => {
    const mensagem =
      itens.length === 1
        ? "Esse é o último item do fiado, excluí-lo irá deletar o fiado. Deseja prosseguir?"
        : "Deseja remover esse item?";

    const confirmado = window.confirm(mensagem);
    if (!confirmado) return;

    try {
      await fiadoService.removerItem(fiadoId, itemId);
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover item");
    }
  };

  const startEditFiado = (fiadoId, fiado) => {
    setEditandoFiado((p) => ({
      ...p,
      [fiadoId]: {
        data: fiado.data,
        observacao: fiado.observacao,
      },
    }));
  };

  const cancelEditFiado = (fiadoId) => {
    setEditandoFiado((p) => {
      const novo = { ...p };
      delete novo[fiadoId];
      return novo;
    });
  };

  const saveEditFiado = async (fiadoId) => {
    const dados = editandoFiado[fiadoId];
    if (!dados || !dados.data || dados.observacao === "") {
      alert("Preencha todos os campos para salvar");
      return;
    }
    try {
      console.log(dados);
      await fiadoService.editar(fiadoId, {
        data: dados.data,
        observacao: dados.observacao,
      });
      cancelEditFiado(fiadoId);
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar fiado");
    }
  };

  const startEditItem = (fiadoId, item) => {
    setEditandoItem((p) => ({
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
    setEditandoItem((p) => {
      const novo = { ...p };
      delete novo[itemId];
      return novo;
    });
  };

  const saveEditItem = async (itemId) => {
    const dados = editandoItem[itemId];
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

  const handleDeleteFiado = async (fiadoId) => {
    if (!window.confirm("Tem certeza que deseja deletar este fiado?")) return;
    try {
      await fiadoService.deletar(fiadoId);
      carregarFiados();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar fiado");
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
                    onClick={(ev) => {
                      if (ev.target.closest("button")) return;
                      toggleFiados(clienteId);
                    }}
                  >
                    <td colSpan="4">
                      <span className="seta">
                        {exibirFiados[clienteId] ? "▼" : "▶"}
                      </span>{" "}
                      Cliente: {fiados[clienteId][0]?.nomeCliente || clienteId}{" "}
                      Valor Total: R$ {saldos[clienteId]?.toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn-pagar"
                        onClick={() => handlePagar(clienteId)}
                      >
                        <PayIcon />
                      </button>
                    </td>
                  </tr>

                  {exibirFiados[clienteId] && (
                    <tr>
                      <td colSpan="6">
                        <table>
                          <thead>
                            <tr>
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
                                    e.tipo === "fiado"
                                      ? "row-fiado"
                                      : "row-pagamento"
                                  }
                                  onClick={(ev) => {
                                    if (
                                      ev.target.closest("button") ||
                                      ev.target.closest("input")
                                    )
                                      return;

                                    if (e.tipo === "fiado") {
                                      toggleItens(e.id);
                                    }
                                  }}
                                >
                                  {editandoFiado[e.id] && e.tipo === "fiado" ? (
                                    <>
                                      <td> {exibirItens[e.id] ? "▼" : "▶"}</td>

                                      <td>
                                        <input
                                          type="datetime-local"
                                          value={editandoFiado[e.id].data}
                                          onChange={(ev) =>
                                            setEditandoFiado((p) => ({
                                              ...p,
                                              [e.id]: {
                                                ...p[e.id],
                                                data: ev.target.value,
                                              },
                                            }))
                                          }
                                        />
                                      </td>

                                      <td>Fiado</td>

                                      <td>
                                        <input
                                          value={editandoFiado[e.id].observacao}
                                          onChange={(ev) =>
                                            setEditandoFiado((p) => ({
                                              ...p,
                                              [e.id]: {
                                                ...p[e.id],
                                                observacao: ev.target.value,
                                              },
                                            }))
                                          }
                                        />
                                      </td>

                                      <td>{e.itens.length}</td>

                                      <td>R$ {e.valorTotal.toFixed(2)}</td>

                                      <td>
                                        <button
                                          className="btn-salvar"
                                          onClick={() => saveEditFiado(e.id)}
                                        >
                                          Salvar
                                        </button>
                                        <button
                                          className="btn-cancelar"
                                          onClick={() => cancelEditFiado(e.id)}
                                        >
                                          Cancelar
                                        </button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td>
                                        {e.tipo === "fiado" &&
                                          (exibirItens[e.id] ? "▼" : "▶")}
                                      </td>

                                      <td>
                                        {new Date(e.data).toLocaleString()}
                                      </td>

                                      <td>
                                        {e.tipo === "fiado"
                                          ? "Fiado"
                                          : "Pagamento"}
                                      </td>

                                      <td>
                                        {e.tipo === "fiado"
                                          ? e.observacao
                                          : "-"}
                                      </td>

                                      <td>
                                        {e.tipo === "fiado"
                                          ? e.itens.length
                                          : "-"}
                                      </td>

                                      <td>
                                        R${" "}
                                        {e.tipo === "fiado"
                                          ? e.valorTotal.toFixed(2)
                                          : e.valorPago.toFixed(2)}
                                      </td>

                                      <td>
                                        <div className="acoes">
                                          {e.tipo === "fiado" && (
                                            <>
                                              <button
                                                className="btn-editar"
                                                onClick={() => {
                                                  startEditFiado(e.id, e);
                                                }}
                                              >
                                                <EditIcon />
                                              </button>

                                              <button
                                                className="btn-deletar"
                                                onClick={() => {
                                                  handleDeleteFiado(e.id);
                                                }}
                                              >
                                                <DeleteIcon />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>

                                {/* Itens do fiado */}
                                {e.tipo === "fiado" && exibirItens[e.id] && (
                                  <tr>
                                    <td colSpan="7">
                                      <table className="itens-table">
                                        <thead>
                                          <tr>
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                            <th>Valor</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {e.itens.map((item) => (
                                            <tr
                                              key={item.id}
                                              className="item-row"
                                            >
                                              {editandoItem[item.id] ? (
                                                <>
                                                  <td>
                                                    <input
                                                      value={
                                                        editandoItem[item.id]
                                                          .nome
                                                      }
                                                      onChange={(ev) =>
                                                        setEditandoItem(
                                                          (p) => ({
                                                            ...p,
                                                            [item.id]: {
                                                              ...p[item.id],
                                                              nome: ev.target
                                                                .value,
                                                            },
                                                          }),
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="number"
                                                      value={
                                                        editandoItem[item.id]
                                                          .quantidade
                                                      }
                                                      onChange={(ev) =>
                                                        setEditandoItem(
                                                          (p) => ({
                                                            ...p,
                                                            [item.id]: {
                                                              ...p[item.id],
                                                              quantidade:
                                                                Number(
                                                                  ev.target
                                                                    .value,
                                                                ),
                                                            },
                                                          }),
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      value={
                                                        editandoItem[item.id]
                                                          .valor
                                                      }
                                                      onChange={(ev) =>
                                                        setEditandoItem(
                                                          (p) => ({
                                                            ...p,
                                                            [item.id]: {
                                                              ...p[item.id],
                                                              valor: Number(
                                                                ev.target.value,
                                                              ),
                                                            },
                                                          }),
                                                        )
                                                      }
                                                    />
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
                                                      className="btn-salvar"
                                                      onClick={() =>
                                                        saveEditItem(item.id)
                                                      }
                                                    >
                                                      Salvar
                                                    </button>
                                                    <button
                                                      className="btn-cancelar"
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
                                                    <div className="acoes">
                                                      <button
                                                        className="btn-editar"
                                                        onClick={() =>
                                                          startEditItem(
                                                            e.id,
                                                            item,
                                                          )
                                                        }
                                                      >
                                                        <EditIcon />
                                                      </button>
                                                      <button
                                                        className="btn-deletar"
                                                        onClick={() => {
                                                          removeItem(
                                                            e.id,
                                                            item.id,
                                                            e.itens,
                                                          );
                                                        }}
                                                      >
                                                        <DeleteIcon />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </>
                                              )}
                                            </tr>
                                          ))}

                                          {/* Novo item */}
                                          <tr>
                                            <td>
                                              <button
                                                className="btn-novo"
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
