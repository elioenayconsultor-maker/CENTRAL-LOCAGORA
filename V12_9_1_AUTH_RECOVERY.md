# V12.9.1 — autenticação e recuperação

Correções sobre a V12.9:

- O primeiro acesso usa sempre a origem atual da Central (`window.location.origin`) no `emailRedirectTo`, evitando que o Site URL compartilhado do Supabase redirecione para o CRM.
- O retorno de ativação permanece em `/auth/confirm?next=/account/update-password`.
- Adicionado botão **Esqueci minha senha** na tela de acesso corporativo.
- A recuperação usa `resetPasswordForEmail()` e retorna para a mesma Central, seguindo o fluxo `/auth/confirm?next=/account/update-password`.
- Mantida a restrição de recuperação para e-mails `@locgrupo.com.br`.

No Supabase Auth, mantenha autorizado:

`https://locinvestcalculator.vercel.app/**`

O `Site URL` global do projeto compartilhado pode continuar apontando para o CRM.
