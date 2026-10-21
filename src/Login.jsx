import { useState } from "react";
import { entrar, cadastrar } from "./api.js";

// Tela de entrada: um cartão só, que alterna entre "Entrar" e "Criar conta".
export default function Login({ aoEntrar }) {
  const [modo, setModo] = useState("entrar"); // "entrar" | "cadastrar"
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const cadastrando = modo === "cadastrar";

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      if (cadastrando) {
        await cadastrar(nome, email, senha); // cria a conta...
      }
      await entrar(email, senha);            // ...e já entra (guarda o token)
      aoEntrar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="tela-centro">
      <div className="cartao-login">
        <div className="marca">
          <span className="marca-logo">TF</span>
          <div>
            <h1>TaskForge</h1>
            <p className="sub">Do Código ao Contrato</p>
          </div>
        </div>

        <div className="abas">
          <button
            className={!cadastrando ? "aba ativa" : "aba"}
            onClick={() => { setModo("entrar"); setErro(""); }}
          >
            Entrar
          </button>
          <button
            className={cadastrando ? "aba ativa" : "aba"}
            onClick={() => { setModo("cadastrar"); setErro(""); }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={enviar}>
          {cadastrando && (
            <label>
              Nome
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </label>
          <label>
            Senha
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mínimo 6 caracteres" />
          </label>

          {erro && <div className="erro">{erro}</div>}

          <button className="btn-principal" disabled={carregando}>
            {carregando ? "Aguarde..." : cadastrando ? "Criar conta e entrar" : "Entrar"}
          </button>
        </form>

        <p className="dica-rodape">
          A API precisa estar rodando em <code>localhost:8082</code>.
        </p>
      </div>
    </div>
  );
}
