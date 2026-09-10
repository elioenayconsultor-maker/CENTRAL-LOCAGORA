# Locagora V14 — Fase 5

## Escopo aplicado
- CRM corporativo em `/crm` com dashboard, pipeline, detalhe do lead, status, atividades e tarefas;
- simulação pública preservada e vinculada ao detalhe do lead, com atalho para a Jornada/simulador avançado corporativo;
- notificação automática de novos leads por e-mail depois da persistência transacional do lead + simulação;
- destino do e-mail configurável no Admin, sem hardcode no frontend;
- auditoria de cada tentativa de notificação (`pending`, `sent`, `failed`), destino, timestamp, ID do provedor e erro;
- UI pública informa se o lead foi salvo e se a notificação foi enviada, falhou ou ainda não está configurada;
- fluxo administrativo de premissas `draft → review → publish → archive`, mantendo snapshots publicados;
- biblioteca/materiais públicos existente preservada no Admin;
- autenticação, Supabase, rotas corporativas, regras e contratos existentes preservados.

## E-mail: para onde vai
O destinatário é definido em `/admin` na seção **Fase 5 • Notificações de lead → E-mail do time comercial**. O valor fica em `commercial_lead_notification_config.recipient_email`. Assim, a equipe pode trocar o destino sem novo deploy.

O envio é feito no servidor via Resend. Configure na Vercel:
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, usada apenas para despachar/auditar a fila sem expor o destinatário ao visitante);
- `RESEND_API_KEY` (obrigatória para envio);
- `COMMERCIAL_LEAD_FROM_EMAIL` (recomendado; remetente/domínio validado no Resend).

Sem `RESEND_API_KEY`, o lead continua salvo no CRM e a tentativa fica auditada como `failed`. Sem destino ativo no Admin, o lead continua salvo e nenhuma tentativa é criada.

## Deploy Supabase
Depois da Fase 4, aplicar:
`supabase/migrations/20260909_v14_phase5_crm_notifications.sql`

## Segurança operacional
O ZIP não inclui `.env.local`. Use `.env.example` somente como referência e mantenha as credenciais reais na Vercel/ambiente local.
