# Deploy da Fase 5

1. Faça backup/commit da Fase 4 em produção.
2. Preserve as variáveis atuais `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. No SQL Editor do mesmo Supabase, execute **uma vez** o conteúdo de `supabase/migrations/20260909_v14_phase5_crm_notifications.sql`.
4. Na Vercel, configure variáveis **server-only**:
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role do mesmo projeto Supabase. Nunca use prefixo `NEXT_PUBLIC_`.
   - `RESEND_API_KEY`: chave do projeto Resend.
   - `COMMERCIAL_LEAD_FROM_EMAIL`: remetente de domínio validado no Resend, por exemplo `Locagora <leads@seudominio.com>`.
5. Faça deploy/redeploy da aplicação.
6. Entre com um administrador em `/admin`, abra **Fase 5 • Notificações de lead**, informe o e-mail que deve receber os leads e ative a notificação.
7. Faça uma simulação pública em `/simulador`, cadastre um lead de teste e confirme:
   - mensagem de interesse registrado;
   - indicação de e-mail enviado (destino mascarado para o visitante);
   - lead em `/crm`;
   - detalhe do CRM mostrando o destino exato e status do envio.
8. No CRM, teste mudança de status, registro de atividade e criação/conclusão de tarefa.
9. No Admin, valide o fluxo de premissas em uma versão de teste: criar draft → enviar para review → publicar. Não publique premissas de teste em produção sem homologação comercial.

## Onde o e-mail vai
O destino não é fixo no código. Ele é salvo em `public.commercial_lead_notification_config` e alterado pelo Admin. Cada tentativa fica em `public.commercial_lead_notifications`.

## Se o e-mail falhar
O lead e a simulação permanecem salvos. Verifique `/crm` e `/admin` para o status e erro do provedor. Falha de e-mail não desfaz a captura do lead.
