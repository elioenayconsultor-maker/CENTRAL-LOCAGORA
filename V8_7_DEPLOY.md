# Deploy V8.7 + mudança do endereço para Central LOC

## 1. Supabase
Aplique, nesta ordem, as migrations que ainda não estiverem aplicadas:
- `20260912_v14_v8_5_public_presentations.sql`
- `20260913_v14_v8_7_testimonials_email.sql`

## 2. Variáveis Vercel
Confirme as variáveis server-side e públicas já usadas pelo projeto, principalmente:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `COMMERCIAL_LEAD_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (ajustar após a troca do domínio)

## 3. Validar e publicar
```powershell
npm ci
npm run typecheck
npm test
npm run build
npx vercel link
npx vercel --prod
```

## 4. Renomear o projeto Vercel
Após estar vinculado ao projeto atual:
```powershell
npx vercel project rename locinvestcalculator centralloc
```

A mudança depende de `centralloc` estar disponível na conta Vercel. Depois, confirme o domínio de produção exibido pela Vercel e atualize `NEXT_PUBLIC_APP_URL` e as Redirect URLs do Supabase Auth para o novo endereço, fazendo novo deploy se necessário.
