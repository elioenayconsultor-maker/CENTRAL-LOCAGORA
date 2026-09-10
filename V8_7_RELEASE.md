# V8.7 — consolidação do fluxo público, CRM e apresentações

- Fluxo público padronizado: produto -> apresentação -> "Simular este modelo" -> simulador com produto pré-selecionado.
- LocInvest não abre mais diretamente a partir do seletor; passa pela apresentação como os demais produtos.
- Apresentações públicas têm fallback de 10 páginas, navegação numerada e fullscreen.
- História corporativa ganhou fullscreen; História pública e produtos ganharam depoimentos de franqueados.
- Novo Admin de depoimentos por link do YouTube, com placement, destaque, standby e exclusão.
- Gerenciador de apresentações ganhou botões explícitos para standby, reativação/publicação e exclusão.
- Novo catálogo administrável de produtos: adicionar, ativo, standby, fora de comercialização e excluir.
- Navegação contextual Admin <-> CRM/Pipeline <-> Analytics.
- E-mail de confirmação ao cliente, reenvio pelo CRM e teste de Resend no Admin.
- Contraste global corrigido para texto branco/verde sobre superfícies navy, incluindo Locagora em destaque e simulador público.
- Proposta sem largura máxima no workspace, captura PDF 1920x1080 e página PDF 16:9, mantendo editor fixo inferior.
- Migration: 20260913_v14_v8_7_testimonials_email.sql.

Observação de deploy: a migration V8.5 de apresentações e a V8.7 devem estar aplicadas no Supabase antes da publicação.
