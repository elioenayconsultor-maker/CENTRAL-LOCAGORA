# Locagora V14 — Fase 4

## Escopo aplicado
- rota pública `/simulador`, integrada ao shell público existente;
- motor público LocInvest puro que recebe `PremiseSnapshot` explicitamente e não muta configuração global;
- cálculo disponível apenas quando há versão de premissas realmente `published`; fallback legado não é tratado como aprovado;
- somente cenário `published`, sem conservador/base/otimista inventados;
- demonstração de valor antes da captura de dados pessoais;
- captura opcional de nome, e-mail, telefone e consentimento depois do resultado;
- migration aditiva com lead público + simulação vinculados, snapshot integral das premissas e RPC transacional;
- leitura dos registros restrita à equipe comercial autenticada; visitantes apenas executam a RPC de captura;
- nenhuma tabela comercial existente, autenticação, rota corporativa ou contrato atual foi removido/reescrito.

## Decisão conservadora desta fase
Como o documento `docs/decisoes-pendentes.md` ainda não formaliza quais produtos/cenários públicos estão aprovados, a Fase 4 habilita apenas LocInvest e somente a versão comercial publicada. Novos produtos ou cenários exigem aprovação explícita antes de entrarem no simulador público.

## Deploy Supabase
Aplicar `supabase/migrations/20260908_v14_phase4_public_simulator.sql` no mesmo projeto Supabase usado pelo Locagora antes de ativar a captura de leads em produção.

## Validação final
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado com 0 erros e 65 warnings preexistentes na baseline.
- `npm test`: aprovado, 2/2 testes.
- `npm run build`: iniciado com Next.js 16.3.4/Turbopack e bloqueado pelo ambiente Linux: a baseline contém SWC para Windows; o Next tentou baixar `@next/swc-linux-x64-gnu`, mas o runtime não resolveu `registry.npmjs.org` (`EAI_AGAIN`). Log em `phase4-build.txt`.
