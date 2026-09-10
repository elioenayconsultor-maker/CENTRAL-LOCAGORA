# Deploy V8

1. Preserve seu `.env.local` fora do ZIP e copie-o para a pasta V8 apenas no ambiente local.
2. No Supabase SQL Editor execute `supabase/migrations/20260911_v14_phase8_governance.sql`.
3. Confirme na Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` e `COMMERCIAL_LEAD_FROM_EMAIL`.
4. Valide no Windows: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
5. Vincule ao projeto existente somente se necessário: `npx vercel link` e selecione `locinvestcalculator`.
6. Publique: `npx vercel --prod`.
7. Smoke test: `/`, `/admin`, `/crm`, `/analytics`, `/simulador` e EUROLOC pela Jornada Comercial.
