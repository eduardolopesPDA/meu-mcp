// meu-mcp-server: MCP server do projeto "Listagem de perfis de alunos da PDA".
// Base: starter/meu-primeiro-mcp da aula 7.
//
// REGRA DE OURO DE SERVER STDIO: nunca use console.log aqui.
// O stdout é o cano por onde passa o JSON do protocolo. Pra depurar, use console.error.

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import {
  buscarPorHabilidade,
  carregarPerfis,
  HABILIDADE_FORMATO,
  HABILIDADE_MAX,
  LIMITE_RESULTADOS,
} from "./ferramentas.mjs";

const server = new McpServer({
  name: "perfis-pda",
  version: "0.1.0",
});

server.registerTool(
  "buscar_alunos_por_habilidade",
  {
    description:
      "Busca, na lista de perfis de alunos da PDA, quem declarou uma habilidade " +
      "(ex.: React, Python, SQL). Use quando a pessoa perguntar quem sabe ou tem experiência " +
      "com uma tecnologia, ou pedir indicação de alunos para uma vaga ou vitrine. " +
      `Devolve no máximo ${LIMITE_RESULTADOS} alunos, só com nome, cidade e habilidades; ` +
      "nunca dados de contato. Só leitura.",
    inputSchema: z.object({
      habilidade: z
        .string()
        .trim()
        .min(1)
        .max(HABILIDADE_MAX)
        .regex(HABILIDADE_FORMATO, "só letras, números, espaço e . + # -")
        .describe("Uma habilidade só, curta. Ex.: React, Node.js, C#. Sem frases."),
    }),
  },
  async ({ habilidade }) => {
    try {
      const resultado = buscarPorHabilidade(carregarPerfis(), habilidade);
      return {
        content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }],
      };
    } catch (erro) {
      // Erro vira resposta (isError), o server não cai.
      return {
        isError: true,
        content: [{ type: "text", text: `Erro: ${erro.message}` }],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("perfis-pda no ar (stdio).");
