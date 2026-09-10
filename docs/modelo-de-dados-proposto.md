# Modelo de dados proposto — V14

## Identidade e autorização
### `profiles`
`user_id`, `name`, `email`, `status`.

### `roles` / `user_roles`
Papéis mínimos: `admin`, `gestor`, `closer`, `viewer`. Permissões devem ser avaliadas no servidor/RLS.

## Catálogo
### `products`
`id`, `slug`, `name`, `category`, `status`, `public_summary`, `operational_profile`, `display_order`.

### `product_contents`
Conteúdo público versionável: benefícios, funcionamento, responsabilidades, riscos, FAQ e CTAs.

## Premissas
### `premise_versions`
`id`, `version`, `status(draft/review/published/archived)`, `effective_at`, `published_at`, `created_by`, `approved_by`, `notes`.

### `product_premises`
`premise_version_id`, `product_id`, `key`, `value_json`, `unit`, `visibility`, `editable_by_closer`.

Regra: versão publicada é imutável. Nova alteração cria nova versão. Simulação sempre referencia `premise_version_id`.

## Leads/CRM
### `leads`
`id`, `name`, `email`, `phone`, `source`, `product_interest`, `capital_band`, `stage`, `owner_id`, `last_interaction_at`, `next_action_at`, `notes`, `consent_at`.

### `lead_activities`
`id`, `lead_id`, `type`, `body`, `actor_id`, `created_at`, `metadata`.

### `tasks`
`id`, `lead_id`, `owner_id`, `type`, `due_at`, `status`, `template_id`, `completed_at`.

## Simulação
### `simulations`
`id`, `lead_id?`, `product_id`, `premise_version_id`, `channel(public/closer)`, `scenario`, `inputs_json`, `outputs_json`, `created_by?`, `created_at`.

### `simulation_scenarios`
Opcional para comparação conservador/base/otimista quando houver premissas aprovadas.

## Proposta
### `proposals`
`id`, `lead_id`, `simulation_id`, `premise_version_id`, `status`, `snapshot_json`, `pdf_path`, `created_by`, `created_at`, `valid_until`.

Regra: `snapshot_json` e vínculo da versão tornam proposta histórica reproduzível; alterações futuras não reescrevem proposta emitida.

## Conteúdo/material
### `materials`
`id`, `product_id?`, `title`, `kind`, `storage_path`, `audience`, `status`, `valid_from`, `valid_until`, `version`, `published_by`.

## Analytics
### `analytics_events` (se first-party)
Somente IDs técnicos/pseudônimos e parâmetros mínimos; evitar PII. Alternativamente enviar a provedor com contrato de eventos documentado.

## Migração
Não remover tabelas V13 inicialmente. Criar V14 lado a lado, migrar/validar, depois arquivar legado com migration reversível.
