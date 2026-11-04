# perfis-pda

MCP server do projeto **Listagem de perfis de alunos da PDA**. Ele dá ao Claude Code uma
única ferramenta, `buscar_alunos_por_habilidade`, que encontra alunos por uma habilidade
(React, Python, C#...) sem expor dados de contato.

O server é só de leitura e lê apenas o arquivo `meu-mcp-server/dados/perfis.json`.

## Requisitos

- Node.js 20 ou mais novo
- Claude Code

## Instalação

```bash
cd meu-mcp-server
npm install
npm test
```

## Conectar ao Claude Code

O server usa o escopo `local`: fica ligado só neste projeto e a configuração não vai para o
git. Rode a partir da pasta do projeto, trocando o caminho pelo caminho absoluto na sua máquina:

```bash
claude mcp add perfis-pda --scope local -- node "C:/caminho/para/meu mcp/meu-mcp-server/server.mjs"
```

Para ver as mensagens do protocolo, conecte pelo `espiao.mjs` no lugar do `server.mjs`. Ele
sobe o server por baixo e anota cada mensagem trocada em `meu-mcp-server/conversa.log`:

```bash
claude mcp add perfis-pda --scope local -- node "C:/caminho/para/meu mcp/meu-mcp-server/espiao.mjs"
```

Depois, confira com `/mcp` dentro do Claude Code. Se alterar o código do server, reconecte
por ali para carregar a versão nova.

## Como usar

É só perguntar em linguagem normal. O Claude decide quando chamar a ferramenta:

- "Quem sabe React?"
- "Me indica alunos que mexem com Python"
- "Tem alguém com C# na turma?"

Exemplo de resposta da ferramenta para `React`:

```json
{
  "habilidade": "React",
  "total": 3,
  "alunos": [
    { "nome": "Ana Souza", "cidade": "São Paulo", "habilidades": ["React", "Node.js", "TypeScript"] },
    { "nome": "Carla Nunes", "cidade": "Belo Horizonte", "habilidades": ["react", "CSS", "Figma"] },
    { "nome": "Felipe Costa", "cidade": "Salvador", "habilidades": ["Python", "Django", "React"] }
  ]
}
```

## A ferramenta

`buscar_alunos_por_habilidade(habilidade)`

| | |
|---|---|
| **Entrada** | `habilidade`: uma só, de 1 a 40 caracteres, com letras, números, espaço e `. + # -` |
| **Busca** | Nome exato da habilidade, sem diferenciar maiúscula de minúscula (`react` acha `React`, mas `ReactJS` não) |
| **Saída** | `habilidade`, `total` encontrado e até 10 `alunos`, cada um só com `nome`, `cidade` e `habilidades` |

### Limites de segurança

Detalhados em [`DECISAO-ESCOPO.md`](DECISAO-ESCOPO.md):

- **Só leitura.** O código não tem nenhuma função de escrita.
- **Caminho fixo.** A ferramenta não recebe caminho de arquivo e não lê nada além de `dados/perfis.json`.
- **Sem contato.** A resposta é montada campo a campo, então e-mail, telefone e bio nunca saem.
- **Consentimento.** Alunos com `publico: false` não aparecem.
- **Contra raspagem.** No máximo 10 alunos por chamada.
- **Sem texto livre.** Frases e instruções são recusadas pelo schema e de novo pela função.

## Estrutura

```
meu mcp/
├── DECISAO-ESCOPO.md          # o que a ferramenta pode e não pode fazer
└── meu-mcp-server/
    ├── server.mjs             # registra a ferramenta e sobe o server stdio
    ├── ferramentas.mjs        # lógica da busca (função pura, testável)
    ├── espiao.mjs             # registra o protocolo em conversa.log
    ├── dados/perfis.json      # perfis dos alunos (dados fictícios)
    └── tests/                 # testes com node:test
```

> Num server stdio, nunca use `console.log`: o stdout é o canal do protocolo. Para depurar,
> use `console.error`.
