# Locagora Central V14 — Fase 6

## Escopo implementado
- Contrato de eventos do funil comercial sem PII desnecessária.
- Captura de eventos do simulador público: visita, premissas, cálculo, validação, captura do lead e status da notificação.
- Captura de eventos do CRM: visualização do pipeline e mudança de status do lead.
- Dashboard autenticado em `/analytics`, com funil agregado dos últimos 30 dias.
- Migration aditiva `20260910_v14_phase6_analytics.sql`.
- Correção de UX no simulador: e-mail incompleto é validado antes do envio e erros de persistência são diferenciados.

## Privacidade
A tabela `commercial_analytics_events` não possui colunas de nome, e-mail ou telefone. A sessão analítica é um UUID técnico aleatório de `sessionStorage`. PII permanece apenas no CRM das fases anteriores.

## Validação
- Typecheck: aprovado.
- Lint: aprovado, 0 erros; 70 warnings já presentes na baseline Fase 5.1.
- Testes: 8/8 aprovados.
- Build: bloqueado no runtime Linux desta sessão porque o Next.js tentou baixar `@next/swc-linux-x64-gnu` e o registry npm retornou `EAI_AGAIN`. Não houve erro de TypeScript antes desse bloqueio.

## Deploy
1. Preservar o `.env.local`/variáveis já configuradas.
2. Aplicar `supabase/migrations/20260910_v14_phase6_analytics.sql` no mesmo Supabase.
3. Rodar localmente `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
4. Publicar na Vercel e testar `/simulador`, `/crm` e `/analytics`.
