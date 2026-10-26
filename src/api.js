// ─────────────────────────────────────────────────────────────────────────
// api.js  ·  a "cozinha" do front: todo contato com o back-end passa por aqui.
// Se um dia o endereço da API mudar, muda SÓ aqui embaixo.
// ─────────────────────────────────────────────────────────────────────────

// Em produção (Cloudflare Pages), o endereço da API vem da variável VITE_API_URL,
// definida no painel do Cloudflare. Na sua máquina, sem ela, cai no back-end local.
export const API = import.meta.env.VITE_API_URL || "http://localhost:8082";

// Onde o crachá (o token JWT) fica guardado no navegador.
const CHAVE_TOKEN = "taskforge_token";
const CHAVE_EMAIL = "taskforge_email";

export function salvarSessao(token, email) {
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_EMAIL, email);
}
export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_EMAIL);
}
export function pegarToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}
export function pegarEmail() {
  return localStorage.getItem(CHAVE_EMAIL);
}

// Erro especial pra quando o token venceu (401): o App usa isso pra deslogar.
export class SessaoExpiradaError extends Error {}

// A função central: monta o pedido, põe o crachá no cabeçalho e trata as respostas.
async function pedir(caminho, opcoes = {}) {
  const token = pegarToken();
  const headers = { "Content-Type": "application/json", ...opcoes.headers };
  if (token) headers["Authorization"] = "Bearer " + token;

  let resposta;
  try {
    resposta = await fetch(API + caminho, { ...opcoes, headers });
  } catch (e) {
    // fetch só cai aqui quando NÃO conseguiu nem falar com a API
    // (back-end desligado, ou bloqueio de CORS).
    throw new Error(
      "Não consegui falar com a API. Ela está rodando em " + API + " ? (e o CORS liberado pra esta porta?)"
    );
  }

  if (resposta.status === 401) {
    throw new SessaoExpiradaError("Sessão expirada");
  }

  // 204 = deu certo e não tem corpo (ex.: DELETE).
  if (resposta.status === 204) return null;

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // o back-end manda {campos:{nome:"..."}} quando a validação falha (aula 8.1)
    const msg =
      (corpo && corpo.campos && Object.values(corpo.campos)[0]) ||
      (corpo && corpo.mensagem) ||
      "Deu ruim (status " + resposta.status + ").";
    throw new Error(msg);
  }
  return corpo;
}

// ── As ações que as telas usam ──────────────────────────────────────────────

export function cadastrar(nome, email, senha) {
  return pedir("/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  });
}

export async function entrar(email, senha) {
  let resposta;
  try {
    resposta = await pedir("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  } catch (e) {
    // No login, um 401 não é "sessão expirada": é email/senha errados.
    if (e instanceof SessaoExpiradaError) {
      throw new Error("Email ou senha inválidos.");
    }
    throw e;
  }
  salvarSessao(resposta.token, email);
  return resposta.token;
}

export function listarTarefas(concluida) {
  // concluida: undefined = todas · true = concluídas · false = pendentes
  const filtro = concluida === undefined ? "" : "?concluida=" + concluida;
  return pedir("/tarefas" + filtro);
}

export function criarTarefa(nome, prioridade) {
  return pedir("/tarefas", {
    method: "POST",
    body: JSON.stringify({ nome, prioridade, concluida: false }),
  });
}

export function atualizarTarefa(id, tarefa) {
  return pedir("/tarefas/" + id, {
    method: "PUT",
    body: JSON.stringify(tarefa),
  });
}

export function apagarTarefa(id) {
  return pedir("/tarefas/" + id, { method: "DELETE" });
}
