import { useState } from "react";
import { pegarToken, pegarEmail, limparSessao } from "./api.js";
import Login from "./Login.jsx";
import Painel from "./Painel.jsx";

// O App decide qual tela mostrar: sem token -> Login; com token -> Painel.
export default function App() {
  const [logado, setLogado] = useState(Boolean(pegarToken()));

  function aoEntrar() {
    setLogado(true);
  }

  function sair() {
    limparSessao();
    setLogado(false);
  }

  if (!logado) {
    return <Login aoEntrar={aoEntrar} />;
  }
  return <Painel email={pegarEmail()} aoSair={sair} />;
}
