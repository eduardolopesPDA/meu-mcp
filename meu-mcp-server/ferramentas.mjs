// A lógica da tool mora aqui, separada do server.
// Motivo: função pura dá pra testar com `npm test` sem abrir o Claude Code.
// Cada limite abaixo está listado no DECISAO-ESCOPO.md.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Caminho FIXO. A tool não recebe caminho como parâmetro, então não dá pra
// apontá-la pra outro arquivo.
const ARQUIVO_PERFIS = fileURLToPath(new URL("./dados/perfis.json", import.meta.url));

// Limites compartilhados com o schema do server.mjs (uma fonte só).
export const HABILIDADE_MAX = 40;
export const HABILIDADE_FORMATO = /^[\p{L}\p{N} .+#-]+$/u; // letras, números, espaço e . + # -
export const LIMITE_RESULTADOS = 10;

// Só leitura: não existe função de escrita neste arquivo.
export function carregarPerfis(arquivo = ARQUIVO_PERFIS) {
  return JSON.parse(readFileSync(arquivo, "utf8"));
}

const normalizar = (texto) => texto.trim().toLowerCase();

export function buscarPorHabilidade(perfis, habilidade) {
  const alvo = typeof habilidade === "string" ? habilidade.trim() : "";
  if (!alvo || alvo.length > HABILIDADE_MAX || !HABILIDADE_FORMATO.test(alvo)) {
    throw new Error(
      `habilidade inválida: use de 1 a ${HABILIDADE_MAX} caracteres (letras, números, espaço e . + # -)`,
    );
  }

  const encontrados = perfis
    .filter((perfil) => perfil.publico === true)
    .filter((perfil) => perfil.habilidades.some((h) => normalizar(h) === normalizar(alvo)));

  return {
    habilidade: alvo,
    total: encontrados.length,
    // Allow-list: só estes três campos saem. E-mail, telefone e bio ficam pra trás.
    alunos: encontrados.slice(0, LIMITE_RESULTADOS).map((perfil) => ({
      nome: perfil.nome,
      cidade: perfil.cidade,
      habilidades: perfil.habilidades,
    })),
  };
}
