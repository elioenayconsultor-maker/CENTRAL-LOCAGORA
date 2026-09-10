# Locagora Central V14 — V8 / F8

## Escopo
Consolidação de governança, operação e produção sobre a Fase 7.1, preservando autenticação, Supabase, contratos comerciais, rotas e motores existentes.

### Governança e segurança
- Gestão de perfis `admin`, `gestor`, `closer` e `visualizacao` a partir do Admin.
- Concessão/revogação vinculada ao usuário real do Supabase Auth.
- Proteção contra remoção do último administrador ativo.
- Compatibilidade com `commercial_admins` legado e `commercial_memberships` V14.
- Auditoria aditiva de alterações críticas.

### Operação
- Painel de saúde de Supabase, service role, Resend, remetente e URL da aplicação sem exibir segredos.
- CRM com busca, filtro de status, exportação CSV, WhatsApp e reenvio manual de notificação.
- Analytics 7/30/90 dias, exportação CSV e distribuição de eventos por produto sem PII.

### UX/comercial solicitado
- Versão `V14 F8` branca, muito pequena e alinhada à base do logo.
- Títulos em superfícies escuras brancos; hero "Conheça a Locagora antes de falar de produto" branco e em negrito forte.
- Taxa ADM em telas de cliente sem prefixo "Opção"; seta de seleção visualmente discreta.
- EUROLOC com dimensionamento por capital ou por quantidade de motos, troca automática de perfil e cálculo do capital necessário.

## Banco
Aplicar após as migrations anteriores:
`supabase/migrations/20260911_v14_phase8_governance.sql`

A migration é aditiva e não altera os motores comerciais nem remove estruturas anteriores.

## Validação nesta execução
- Testes estáticos/regressão: 17/17 aprovados.
- Parsing TypeScript/TSX dos novos arquivos e arquivos modificados: aprovado.
- `npm ci` não concluiu neste runtime por indisponibilidade/timeout do registry; por isso typecheck/lint/build completos devem ser executados na máquina Windows/Vercel antes do deploy.
