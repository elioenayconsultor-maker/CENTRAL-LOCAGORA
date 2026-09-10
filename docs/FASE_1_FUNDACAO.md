# V14 — Fase 1: Fundação limpa

## Implementado
- Papéis canônicos: `admin`, `gestor`, `closer`, `visualizacao`, com matriz de permissões no domínio.
- Migration de memberships com RLS e função `has_commercial_role`.
- Premissas comerciais em versões imutáveis com estados `draft`, `review`, `published`, `archived`.
- Publicação transacional via RPC; somente uma versão pode estar publicada.
- Snapshot/versionamento preparado em simulações e propostas para preservar histórico.
- Repositório de premissas separado da UI e `PremisesProvider` como nova fonte de leitura.
- Adapter V13 mantido temporariamente apenas para não quebrar calculadoras existentes; consumidores serão migrados nas fases de simulador.
- Tokens visuais extraídos e estados transversais de loading/erro/vazio/sem permissão.
- Scripts de `typecheck` e testes básicos adicionados.

## Decisões arquiteturais
1. UI não decide autorização: RLS e funções SQL são a barreira real.
2. Uma proposta/simulação deve gravar `premise_version_id`, `premise_version` e `premise_snapshot`.
3. Valores publicados não são editados in-place; uma mudança cria nova versão.
4. `commercial_settings` permanece somente como compatibilidade da V13 durante a migração.

## Pendências deliberadas
- Migrar cada calculadora para consumir `usePremises()` sem mutação de constantes globais.
- Criar telas `/app/*` e nova administração de usuários/premissas nas fases correspondentes.
- Aplicar a migration V14 no Supabase antes de testar a nova leitura remota.
