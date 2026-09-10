# Plano de reconstrução — V14

## Estratégia
Reconstrução incremental em nova linha V14, preservando V13.2 como rollback. Evitar big-bang de banco. Cada fase termina com lint + typecheck + testes + build e preview visual.

## Fase 0 — concluída nesta entrega
- Auditoria técnica/produto.
- Mapa de rotas.
- Inventário.
- Modelo de dados proposto.
- Plano e decisões pendentes.

**Pronto quando:** sete documentos existem e nenhum código funcional da baseline foi alterado.

## Fase 1 — fundação
1. Criar scripts `typecheck`, `test`, `test:integration`, `test:e2e`.
2. Design tokens e primitives acessíveis.
3. Estrutura `features/`, `domain/`, `data/`, `auth/`, `analytics/`.
4. Criar autorização server-side por papéis.
5. Introduzir schema validation nas APIs/actions.
6. Criar modelo de versões de premissas sem remover V13.

**Risco:** incompatibilidade com schema CRM compartilhado. **Mitigação:** migrations aditivas e RLS testada.

## Fase 2 — shell visual/responsivo
- Landing pública passa a `/`.
- Layout público e `/app` separados.
- Poppins/Inter via `next/font`.
- Componentes base AA, 44px touch target, 375/768/1024/1440.

## Fase 3 — conversão pública
- História HTML + mídia.
- Portfólio filtrável/comparador.
- “Encontrar meu modelo”.
- Detalhes por produto.

## Fase 4 — simulador público
- Motor puro recebe versão de premissas explicitamente.
- Cenários apenas quando aprovados.
- Captura de lead depois do valor demonstrado.
- Lead + simulação chegam vinculados ao CRM.

## Fase 5 — closer/CRM/admin
- Dashboard, pipeline, lead detail, atividades, tarefas.
- Simulador avançado.
- Biblioteca/materiais.
- Admin draft → review → publish → archive.

## Fase 6 — analytics
Contrato de eventos e funil sem PII desnecessária.

## Fase 7 — hardening
- RLS/permissões.
- Testes de cálculo/regressão.
- E2E auth e rotas.
- A11y/keyboard.
- Lighthouse em preview.
- otimização de imagens e remoção de legado.

## Cutover
1. Deploy preview V14.
2. Smoke + dados.
3. Homologação comercial.
4. Publicar V14 mantendo deploy V13.2 identificável para rollback.
5. Monitorar erros e conversão.

## Definição global de pronto
Nenhum crítico/alto aberto; build/testes verdes; autorização validada; premissas versionadas; proposta reproduzível; mobile/desktop homologados; sem dado fictício.
