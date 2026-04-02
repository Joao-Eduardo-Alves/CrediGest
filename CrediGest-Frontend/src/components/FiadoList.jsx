import React, { useState, useEffect } from "react";
import fiadoService from "../services/fiadoService";
import { EditIcon, DeleteIcon, PayIcon } from "./Icons";
import "./FiadoList.css";

import toast from "../utils/toast";

//import novo
import clienteService from "../services/clienteService";

function FiadoList() {
  const [clientesComHistoricoFinanceiro, setClientesComHistoricoFinanceiro] =
    useState({});
  const [pagamentos, setPagamentos] = useState({});
  const [exibirFiados, setExibirFiados] = useState({});
  const [exibirItens, setExibirItens] = useState({});
  const [novoItem, setNovoItem] = useState({});
  const [editandoItem, setEditandoItem] = useState({});
  const [editandoFiado, setEditandoFiado] = useState({});
  const [editandoPagamento, setEditandoPagamento] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saldos, setSaldos] = useState({});
  const [modalItemAberto, setModalItemAberto] = useState(null);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(null);
  const [valorPagamento, setValorPagamento] = useState("");

  const formatDatetimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    listarClientesComHistoricoFinanceiro();
  }, []);

  useEffect(() => {
    const carregarSaldos = async () => {
      const novosSaldos = {};
      for (const clienteId of Object.keys(clientesComHistoricoFinanceiro)) {
        const saldo = await fiadoService.obterSaldo(clienteId);
        novosSaldos[clienteId] = saldo;
      }
      setSaldos(novosSaldos);
    };

    if (Object.keys(clientesComHistoricoFinanceiro).length) {
      carregarSaldos();
    }
  }, [clientesComHistoricoFinanceiro]);

  const listarClientesComHistoricoFinanceiro = async () => {
    setLoading(true);
    setError(null);

    try {
      const clientes = await clienteService.listar();

      const fiadosData = await fiadoService.listar();

      const fiadosAgrupados = fiadosData.reduce((acc, f) => {
        if (!acc[f.clienteId]) acc[f.clienteId] = [];
        acc[f.clienteId].push(f);
        return acc;
      }, {});

      const pagamentos = {};

      for (const cliente of clientes) {
        try {
          const lista = await fiadoService.listarPagamentos(cliente.id);
          pagamentos[cliente.id] = lista;
        } catch (err) {
          console.error(
            "Erro ao carregar pagamentos do cliente",
            cliente.id,
            err,
          );
          pagamentos[cliente.id] = [];
        }
      }
      setPagamentos(pagamentos);

      const estrutura = {};

      clientes.forEach((c) => {
        estrutura[c.id] = fiadosAgrupados[c.id] || [];
      });

      const clientesComHistoricoFinanceiro = Object.fromEntries(
        Object.entries(estrutura).filter(([clienteId]) => {
          const temFiado = (fiadosAgrupados[clienteId] || []).length > 0;
          const temPagamento = (pagamentos[clienteId] || []).length > 0;

          return temFiado || temPagamento;
        }),
      );

      setClientesComHistoricoFinanceiro(clientesComHistoricoFinanceiro);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados");
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
    if (!item || !item.nome || !item.quantidade || !item.valor) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      await fiadoService.adicionarItens(fiadoId, [
        {
          nomeProduto: item.nome,
          quantidade: parseFloat(item.quantidade) || 0,
          valorProduto: parseFloat(item.valor) || 0,
        },
      ]);
      setNovoItem((p) => ({
        ...p,
        [fiadoId]: { nome: "", quantidade: 1, valor: 0 },
      }));
      listarClientesComHistoricoFinanceiro();
      toast.success("Item adicionado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar item");
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
      listarClientesComHistoricoFinanceiro();
      toast.success("Item removido com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover item");
    }
  };

  const startEditFiado = (fiadoId, fiado) => {
    setEditandoFiado((p) => ({
      ...p,
      [fiadoId]: {
        data: formatDatetimeForInput(fiado.data),
        observacao: fiado.observacao ?? "",
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
    if (!dados?.data) {
      toast.warning("Preencha a data para salvar");
      return;
    }
    const dataSelecionada = new Date(dados.data);
    const hoje = new Date();

    // Zera hora pra comparar so a data
    hoje.setHours(0, 0, 0, 0);
    dataSelecionada.setHours(0, 0, 0, 0);

    if (dataSelecionada > hoje) {
      toast.error("A data não pode ser futura");
      return;
    }

    try {
      await fiadoService.editar(fiadoId, {
        data: dados.data,
        observacao: dados.observacao,
      });
      cancelEditFiado(fiadoId);
      listarClientesComHistoricoFinanceiro();
      toast.success("Fiado atualizado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar fiado");
    }
  };

  const startEditPagamento = (pagamentoId, pagamento) => {
    setEditandoPagamento((p) => ({
      ...p,
      [pagamentoId]: {
        data: formatDatetimeForInput(pagamento.data),
        valorPago: pagamento.valorPago,
      },
    }));
  };

  const cancelEditPagamento = (pagamentoId) => {
    setEditandoPagamento((p) => {
      const novo = { ...p };
      delete novo[pagamentoId];
      return novo;
    });
  };

  const saveEditPagamento = async (pagamentoId) => {
    const dados = editandoPagamento[pagamentoId];
    if (!dados?.data) {
      toast.error("Preencha a data para salvar");
      return;
    }
    const dataSelecionada = new Date(dados.data);
    const hoje = new Date();

    // Zera hora pra comparar so a data
    hoje.setHours(0, 0, 0, 0);
    dataSelecionada.setHours(0, 0, 0, 0);

    if (dataSelecionada > hoje) {
      toast.error("A data não pode ser futura");
      return;
    }

    const valor = parseFloat(dados.valorPago);

    if (!(valor > 0)) {
      toast.error("O valor deve ser maior que zero");
      return;
    }
    try {
      await fiadoService.editarPagamento(pagamentoId, {
        data: dados.data,
        valorPago: valor,
      });

      cancelEditPagamento(pagamentoId);
      listarClientesComHistoricoFinanceiro();
      toast.success("Pagamento atualizado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar pagamento");
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
      toast.error("Preencha todos os campos para salvar");
      return;
    }
    try {
      await fiadoService.editarItem(dados.fiadoId, itemId, {
        nomeProduto: dados.nome,
        quantidade: dados.quantidade,
        valorProduto: dados.valor,
      });
      cancelEditItem(itemId);
      listarClientesComHistoricoFinanceiro();
      toast.success("Item atualizado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar item");
    }
  };

  const handleDeleteFiado = async (fiadoId) => {
    if (!window.confirm("Tem certeza que deseja deletar este fiado?")) return;
    try {
      await fiadoService.deletar(fiadoId);
      listarClientesComHistoricoFinanceiro();
      toast.success("Fiado deletado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao deletar fiado");
    }
  };

  const handlePagar = (clienteId) => {
    setModalPagamentoAberto(clienteId);
  };

  const confirmarPagamento = async () => {
    try {
      const clienteId = modalPagamentoAberto;
      const valor = valorPagamento;

      if (!valor || isNaN(valor) || Number(valor) <= 0) {
        toast.error("Valor inválido");
        return;
      }

      await fiadoService.registrarPagamento(clienteId, {
        valorPago: Number(valor),
      });
      toast.success("Pagamento registrado com sucesso");
      setModalPagamentoAberto(null);
      setValorPagamento("");
      listarClientesComHistoricoFinanceiro();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar pagamento");
    }
  };
  const handleDeletePagamento = async (pagamentoId) => {
    if (!window.confirm("Tem certeza que deseja deletar este pagamento?"))
      return;

    try {
      await fiadoService.excluirPagamento(pagamentoId);
      listarClientesComHistoricoFinanceiro();
      toast.success("Pagamento deletado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover pagamento");
    }
  };

  const gerarExtratoCliente = (clienteId) => {
    const listaFiados = clientesComHistoricoFinanceiro[clienteId] || [];
    const listaPagamentos = pagamentos[clienteId] || [];

    const eventos = [
      ...listaFiados.map((f) => ({ ...f, tipo: "fiado" })),
      ...listaPagamentos.map((p) => ({ ...p, tipo: "pagamento" })),
    ];

    eventos.sort((a, b) => new Date(b.data) - new Date(a.data));

    return eventos;
  };
  const totalGeral = Object.values(saldos).reduce(
    (acc, saldo) => acc + (saldo || 0),
    0,
  );
  const formatarSaldo = (saldo) => {
    if (saldo > 0) {
      return {
        texto: `Deve: R$ ${saldo.toFixed(2)}`,
        classe: "saldo-devedor",
      };
    }

    if (saldo < 0) {
      return {
        texto: `Crédito: R$ ${Math.abs(saldo).toFixed(2)}`,
        classe: "saldo-credito",
      };
    }

    return {
      texto: "Saldo zerado",
      classe: "saldo-zero",
    };
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

      {Object.keys(clientesComHistoricoFinanceiro).length === 0 ? (
        <p>Nenhum fiado encontrado</p>
      ) : (
        <table>
          <tbody>
            {Object.keys(clientesComHistoricoFinanceiro).map((clienteId) => {
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
                      Cliente:{" "}
                      {clientesComHistoricoFinanceiro[clienteId]?.nome ||
                        clienteId}{" "}
                      {(() => {
                        const saldo = saldos[clienteId] ?? 0;
                        const { texto, classe } = formatarSaldo(saldo);

                        return <span className={classe}>{texto}</span>;
                      })()}
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
                              <React.Fragment key={`${e.tipo}-${e.id}`}>
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
                                  {e.tipo === "fiado" && editandoFiado[e.id] ? (
                                    <>
                                      <td>{exibirItens[e.id] ? "▼" : "▶"}</td>

                                      <td>
                                        <input
                                          type="datetime-local"
                                          value={
                                            editandoFiado[e.id]?.data || ""
                                          }
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
                                          placeholder="Digite a observação"
                                          value={
                                            editandoFiado[e.id].observacao ?? ""
                                          }
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
                                  ) : e.tipo === "pagamento" &&
                                    editandoPagamento[e.id] ? (
                                    <>
                                      <td></td>

                                      <td>
                                        <input
                                          type="datetime-local"
                                          value={
                                            editandoPagamento[e.id]?.data || ""
                                          }
                                          onChange={(ev) =>
                                            setEditandoPagamento((p) => ({
                                              ...p,
                                              [e.id]: {
                                                ...p[e.id],
                                                data: ev.target.value,
                                              },
                                            }))
                                          }
                                        />
                                      </td>

                                      <td>Pagamento</td>

                                      <td>-</td>

                                      <td>-</td>

                                      <td>
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0.01"
                                          value={
                                            editandoPagamento[e.id]
                                              ?.valorPago ?? ""
                                          }
                                          onChange={(ev) =>
                                            setEditandoPagamento((p) => ({
                                              ...p,
                                              [e.id]: {
                                                ...p[e.id],
                                                valorPago: ev.target.value,
                                              },
                                            }))
                                          }
                                        />
                                      </td>

                                      <td>
                                        <button
                                          className="btn-salvar"
                                          onClick={() =>
                                            saveEditPagamento(e.id)
                                          }
                                        >
                                          Salvar
                                        </button>
                                        <button
                                          className="btn-cancelar"
                                          onClick={() =>
                                            cancelEditPagamento(e.id)
                                          }
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
                                                onClick={() =>
                                                  startEditFiado(e.id, e)
                                                }
                                              >
                                                <EditIcon />
                                              </button>

                                              <button
                                                className="btn-deletar"
                                                onClick={() =>
                                                  handleDeleteFiado(e.id)
                                                }
                                              >
                                                <DeleteIcon />
                                              </button>
                                            </>
                                          )}

                                          {e.tipo === "pagamento" && (
                                            <>
                                              <button
                                                className="btn-editar"
                                                onClick={() =>
                                                  startEditPagamento(e.id, e)
                                                }
                                              >
                                                <EditIcon />
                                              </button>

                                              <button
                                                className="btn-deletar"
                                                onClick={() =>
                                                  handleDeletePagamento(e.id)
                                                }
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
                                                      placeholder="Nome do produto"
                                                      value={
                                                        editandoItem[item.id]
                                                          ?.nome || ""
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
                                                      placeholder="1"
                                                      min="1"
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
                                                                ev.target.value,
                                                            },
                                                          }),
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="number"
                                                      placeholder="Valor"
                                                      min="0.01"
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
                                                              valor:
                                                                ev.target.value,
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

      {/* Modais  */}
      {modalItemAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Novo Item</h3>

            <input
              placeholder="Nome do produto"
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
              min="1"
              value={novoItem[modalItemAberto]?.quantidade || ""}
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
              min="0.01"
              value={novoItem[modalItemAberto]?.valor || ""}
              onChange={(e) =>
                setNovoItem((p) => ({
                  ...p,
                  [modalItemAberto]: {
                    ...p[modalItemAberto],
                    valor: e.target.value,
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

      {modalPagamentoAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Registrar Pagamento</h3>

            {(() => {
              const saldo = saldos[modalPagamentoAberto];

              if (saldo > 0) {
                return <p>O cliente deve: R$ {saldo.toFixed(2)}</p>;
              } else if (saldo < 0) {
                return (
                  <p>
                    O cliente tem: R$ {Math.abs(saldo).toFixed(2)} de crédito
                  </p>
                );
              } else {
                return <p>Saldo zerado</p>;
              }
            })()}

            <input
              type="number"
              step="0.01"
              placeholder="Digite o valor do pagamento"
              value={valorPagamento}
              onChange={(e) => setValorPagamento(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={confirmarPagamento}>Confirmar</button>

              <button
                onClick={() => {
                  setModalPagamentoAberto(null);
                  setValorPagamento("");
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="total-geral">
        {totalGeral > 0 && `Total a receber: R$ ${totalGeral.toFixed(2)}`}
        {totalGeral < 0 &&
          `Total em crédito: R$ ${Math.abs(totalGeral).toFixed(2)}`}
        {totalGeral === 0 && `Saldo geral: zerado`}
      </h2>
    </div>
  );
}

export default FiadoList;
