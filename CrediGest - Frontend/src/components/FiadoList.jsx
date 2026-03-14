import React, { useState, useEffect } from "react";
import fiadoService from "../services/fiadoService";
import "./FiadoList.css";

function FiadoList() {
  const [fiados, setFiados] = useState({});
  const [exibirClientes, setExibirClientes] = useState({});
  const [exibirFiados, setExibirFiados] = useState({});
  const [novoItem, setNovoItem] = useState({});
  const [editando, setEditando] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saldos, setSaldos] = useState({});

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
            {Object.entries(fiados).map(([clienteId, lista]) => (
              <React.Fragment key={clienteId}>
                {/* Linha do Cliente */}
                <tr
                  className="cliente-row"
                  onClick={() => toggleCliente(clienteId)}
                >
                  <td colSpan="4">
                    <span className="seta">
                      {exibirClientes[clienteId] ? "▼" : "▶"}
                    </span>{" "}
                    Cliente: {clienteId} ({lista.length} fiados) Valor Total: R${" "}
                    {/* calcular valor total do fiado*/}
                    {saldos[clienteId]?.toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() => handlePagar(clienteId)}
                      className="btn-editar"
                    >
                      Pagar
                    </button>
                  </td>
                </tr>

                {exibirClientes[clienteId] && (
                  <tr className="fiado-container">
                    <td colSpan="6">
                      {/* Tabela de Fiados do Cliente */}
                      <table className="fiados-cliente">
                        <thead>
                          <tr className="info-header">
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Qtde Itens</th>
                            <th>Valor Total</th>
                            <th></th>
                          </tr>
                        </thead>

                        <tbody>
                          {lista.map((fiado) => (
                            <React.Fragment key={fiado.id}>
                              {/* Linha do Fiado */}
                              <tr
                                className="fiado-row"
                                onClick={() => toggleFiado(fiado.id)}
                              >
                                <td>{fiado.clienteId}</td>
                                <td>
                                  {new Date(fiado.data).toLocaleDateString()}
                                </td>
                                <td>{fiado.itens.length}</td>
                                <td>R$ {fiado.valorTotal.toFixed(2)}</td>
                                <td>
                                  <button
                                    className="btn-deletar"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFiado(fiado.id);
                                    }}
                                  >
                                    X
                                  </button>
                                </td>
                              </tr>

                              {/* Itens do Fiado */}
                              {exibirFiados[fiado.id] && (
                                <tr>
                                  <td colSpan="6">
                                    <table className="itens-table">
                                      <thead>
                                        <tr className="info-header">
                                          <th>Produto</th>
                                          <th>Quantidade</th>
                                          <th>Valor</th>
                                          <th>SubTotal</th>
                                          <th>Ações</th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {fiado.itens.map((item) => (
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
                                                    onChange={(e) =>
                                                      setEditando((p) => ({
                                                        ...p,
                                                        [item.id]: {
                                                          ...p[item.id],
                                                          nome: e.target.value,
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
                                                    onChange={(e) =>
                                                      setEditando((p) => ({
                                                        ...p,
                                                        [item.id]: {
                                                          ...p[item.id],
                                                          quantidade: Number(
                                                            e.target.value,
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
                                                    onChange={(e) =>
                                                      setEditando((p) => ({
                                                        ...p,
                                                        [item.id]: {
                                                          ...p[item.id],
                                                          valor: Number(
                                                            e.target.value,
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
                                                  R${" "}
                                                  {item.valorProduto.toFixed(2)}
                                                </td>
                                                <td>
                                                  R${" "}
                                                  {(
                                                    item.valorProduto *
                                                    item.quantidade
                                                  ).toFixed(2)}
                                                </td>

                                                <td>
                                                  <button
                                                    onClick={() =>
                                                      startEditItem(
                                                        fiado.id,
                                                        item,
                                                      )
                                                    }
                                                  >
                                                    Editar
                                                  </button>

                                                  <button
                                                    onClick={() =>
                                                      removeItem(
                                                        fiado.id,
                                                        item.id,
                                                      )
                                                    }
                                                  >
                                                    Remover
                                                  </button>
                                                </td>
                                              </>
                                            )}
                                          </tr>
                                        ))}

                                        {/* Novo Item */}
                                        <tr>
                                          <td>
                                            <input
                                              placeholder="Novo produto"
                                              value={
                                                novoItem[fiado.id]?.nome || ""
                                              }
                                              onChange={(e) =>
                                                setNovoItem((p) => ({
                                                  ...p,
                                                  [fiado.id]: {
                                                    ...p[fiado.id],
                                                    nome: e.target.value,
                                                  },
                                                }))
                                              }
                                            />
                                          </td>

                                          <td>
                                            <input
                                              type="number"
                                              min="1"
                                              value={
                                                novoItem[fiado.id]
                                                  ?.quantidade || 1
                                              }
                                              onChange={(e) =>
                                                setNovoItem((p) => ({
                                                  ...p,
                                                  [fiado.id]: {
                                                    ...p[fiado.id],
                                                    quantidade: Number(
                                                      e.target.value,
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
                                                novoItem[fiado.id]?.valor || 0
                                              }
                                              onChange={(e) =>
                                                setNovoItem((p) => ({
                                                  ...p,
                                                  [fiado.id]: {
                                                    ...p[fiado.id],
                                                    valor: Number(
                                                      e.target.value,
                                                    ),
                                                  },
                                                }))
                                              }
                                            />
                                          </td>

                                          <td>
                                            <button
                                              onClick={() =>
                                                handleAddItem(fiado.id)
                                              }
                                            >
                                              Adicionar
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FiadoList;
