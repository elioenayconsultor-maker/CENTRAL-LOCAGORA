# Locagora V14 — Fase 3

## Escopo aplicado
- conversão pública sobre `/historia`, `/negocios` e `/negocios/[slug]`;
- História pública em HTML responsivo com a mídia institucional já validada no projeto;
- portfólio público com busca textual e filtros por objetivo;
- comparador de até 3 modelos, sem alterar motores comerciais ou premissas;
- fluxo “Encontrar meu modelo” baseado apenas em metadados públicos do portfólio;
- páginas de detalhe enriquecidas com perfil, escopo, estrutura, fatos, mídia e modelos relacionados;
- estados vazios, seleção, feedback e responsividade desktop/tablet/mobile;
- nenhum contrato Supabase, autenticação, API, rota corporativa ou regra de cálculo foi alterado.

## Segurança comercial
O recomendador público não calcula retorno, não cria valores e não substitui simulação ou proposta. Condições comerciais continuam dependentes das premissas vigentes e do fluxo corporativo existente.

## Validação final
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado com 0 erros e 65 warnings preexistentes na baseline.
- `npm test`: aprovado, 2/2 testes.
- `npm run build`: iniciado com Next.js 16.3.4/Turbopack e bloqueado exclusivamente pelo ambiente Linux. A baseline contém `@next/swc-win32-x64-msvc`; o Next tentou baixar `@next/swc-linux-x64-gnu`, mas o runtime não conseguiu resolver `registry.npmjs.org` (`EAI_AGAIN`). O log integral está em `phase3-build.txt`.

## Empacotamento
O ZIP final remove `node_modules`, `.next`, caches e `tsconfig.tsbuildinfo`. `package-lock.json` é preservado para instalação reproduzível com `npm ci` no ambiente de destino.
