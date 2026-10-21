import { useEffect, useState } from "react";
import {
  listarTarefas, criarTarefa, atualizarTarefa, apagarTarefa, SessaoExpiradaError,
} from "./api.js";

// Tela principal: lista as tarefas e deixa criar, concluir, editar e apagar.
export default function Painel({ email, aoSair }) {
  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState("todas"); // "todas" | "pendentes" | "concluidas"
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [novoNome, setNovoNome] = useState("");
  const [novaPrioridade, setNovaPrioridade] = useState(3);

  // Converte o filtro da tela no parâmetro que a API entende.
  function filtroParaApi() {
    if (filtro === "pendentes") return false;
    if (filtro === "concluidas") return true;
    return undefined;
  }

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const lista = await listarTarefas(filtroParaApi());
      setTarefas(lista);
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return aoSair();
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  // Recarrega sempre que o filtro muda.
  useEffect(() => { carregar(); }, [filtro]);

  async function acao(fn) {
    setErro("");
    try {
      await fn();
      await carregar();
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return aoSair();
      setErro(err.message);
    }
  }

  function adicionar(e) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    acao(async () => {
      await criarTarefa(novoNome.trim(), Number(novaPrioridade));
      setNovoNome("");
      setNovaPrioridade(3);
    });
  }

  function alternarConcluida(t) {
    acao(() => atualizarTarefa(t.id, { ...t, concluida: !t.concluida }));
  }

  function renomear(t) {
    const nome = prompt("Novo nome da tarefa:", t.nome);
    if (nome === null) return;
    const limpo = nome.trim();
    if (!limpo) return;
    acao(() => atualizarTarefa(t.id, { ...t, nome: limpo }));
  }

  function remover(t) {
    if (!confirm('Apagar a tarefa "' + t.nome + '"?')) return;
    acao(() => apagarTarefa(t.id));
  }

  const pendentes = tarefas.filter((t) => !t.concluida).length;

  return (
    <div className="pagina">
      <header className="topo">
        <div className="marca">
          <span className="marca-logo">TF</span>
          <div>
            <h1>TaskForge</h1>
            <p className="sub">{email}</p>
          </div>
        </div>
        <button className="btn-sair" onClick={aoSair}>Sair</button>
      </header>

      <main className="conteudo">
        <form className="nova-tarefa" onSubmit={adicionar}>
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nova tarefa..."
            maxLength={100}
          />
          <select value={novaPrioridade} onChange={(e) => setNovaPrioridade(e.target.value)} title="Prioridade">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>Prioridade {n}</option>
            ))}
          </select>
          <button className="btn-principal">Adicionar</button>
        </form>

        <div className="barra-filtros">
          <div className="chips">
            {["todas", "pendentes", "concluidas"].map((f) => (
              <button
                key={f}
                className={filtro === f ? "chip ativo" : "chip"}
                onClick={() => setFiltro(f)}
              >
                {f === "todas" ? "Todas" : f === "pendentes" ? "Pendentes" : "Concluídas"}
              </button>
            ))}
          </div>
          <span className="contador">{pendentes} pendente{pendentes === 1 ? "" : "s"}</span>
        </div>

        {erro && <div className="erro">{erro}</div>}

        {carregando ? (
          <p className="vazio">Carregando...</p>
        ) : tarefas.length === 0 ? (
          <p className="vazio">Nenhuma tarefa aqui. Que tal adicionar a primeira? 👆</p>
        ) : (
          <ul className="lista">
            {tarefas.map((t) => (
              <li key={t.id} className={t.concluida ? "item feito" : "item"}>
                <button
                  className="caixa"
                  onClick={() => alternarConcluida(t)}
                  title={t.concluida ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {t.concluida ? "✓" : ""}
                </button>
                <span className="nome">{t.nome}</span>
                <span className={"prioridade p" + t.prioridade}>P{t.prioridade}</span>
                <button className="icone" onClick={() => renomear(t)} title="Renomear">✎</button>
                <button className="icone perigo" onClick={() => remover(t)} title="Apagar">🗑</button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="rodape">
        TaskForge · front React consumindo a sua API · Do Código ao Contrato
      </footer>
    </div>
  );
}
