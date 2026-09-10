# V12.4 — Correção estrutural profissional

## Rede
O mapa esquemático foi removido do fluxo principal. A Rede usa Google Maps incorporado para a unidade selecionada e links `maps/search/?api=1` para abertura externa. Esta solução não exige chave da Google para o modo atual.

## Apoio Comercial
A biblioteca pode usar `public.support_objections` no Supabase. ADMIN/GESTOR podem editar ou criar conteúdo; demais perfis apenas consultam.
A IA assistente reformula abordagens usando a resposta-base, sem autorização para inventar números, condições, garantias ou regras.

## Login
Configure no Netlify:
`NEXT_PUBLIC_APP_URL=https://locinvestcalculator.netlify.app`

No Supabase Authentication > URL Configuration, mantenha também:
`https://locinvestcalculator.netlify.app/**`

O template de Magic Link/OTP precisa usar `{{ .ConfirmationURL }}` e não um link fixo para o CRM.

## Verificação
1. npm install
2. npm run build
3. testar /api/system/status autenticado ou via navegador
4. testar confirmação de e-mail
5. testar IA de proposta
6. testar IA de objeções
7. gerar PDF
8. abrir unidade no Google Maps
