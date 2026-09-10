# Auditoria técnica — baseline V13.2

## Escopo
Auditoria estática da árvore V13.2 recebida para orientar a reconstrução V14. A V13.2 permanece baseline; este documento não autoriza alterações em produção.

## Stack observada
- Next.js 15.5.x / React 19 / TypeScript 5.7.
- Supabase Auth, Postgres/RLS e Storage.
- Geração de PDF com `@react-pdf/renderer`; legado adicional `jspdf`/`html2canvas` ainda instalado.
- OpenAI em rotas server-side para apoio/proposta.
- App Router com portal público e Central corporativa.

## Achados por severidade

### BLOQUEADOR
1. **Autorização por papel incompleta para a V14.** A Central usa `AuthGate` para validar usuário corporativo, porém a arquitetura-alvo exige `admin`, `closer`, `gestor` e `visualização` com autorização consistente em UI, servidor e RLS. O `/admin` depende de verificação adicional dentro do componente cliente; deve haver enforcement server-side/RLS por operação.
2. **Não existe suíte de testes configurada.** `package.json` não possui scripts `typecheck`, `test`, `test:e2e` ou ferramentas de teste. Os critérios da V14 não podem ser comprovados sem essa fundação.

### CRÍTICO
1. **Estado comercial fragmentado em `localStorage`.** Jornada, proposta pendente, produto pré-selecionado e IDs de sessão usam múltiplas chaves. Há risco de inconsistência entre abas/dispositivos e perda de contexto do lead.
2. **Premissas comerciais possuem duas fontes.** Há defaults hardcoded nos módulos de domínio e configuração remota que muta objetos globais em runtime (`applyCommercialConfig`). Isso dificulta versionamento, concorrência, SSR e reprodução exata de uma simulação.
3. **Versionamento de premissas insuficiente.** `commercial_settings` usa `key` única e auditoria de update; não há entidade imutável de versão publicada com `effective_at`, status, autor, revisão e vínculo obrigatório da simulação/proposta à versão.
4. **CRM da V14 não existe como domínio completo.** Há persistência comercial anterior, mas faltam pipeline, responsável, atividades, tarefas, origem, consentimento, próxima ação e métricas de funil como entidades explícitas.

### ALTO
1. **Shell corporativo é uma SPA interna por estado (`page`) em `/`.** Isso impede URLs profundas por módulo, dificulta analytics, permissões por rota, refresh e navegação semântica. Migrar para rotas reais `/app/...`.
2. **`app/page.tsx` é client component e concentra navegação/estado.** Deve virar landing pública na V14; área corporativa deve ter layout próprio protegido.
3. **`commercial-config.ts` muta constantes importadas.** Substituir por funções puras que recebem `PremiseVersion`/`ProductConfig` explicitamente.
4. **Valores ainda hardcoded em UI/quality.** Exemplos: quick values, LocMillion 1.000.000/25.000 na Jornada e testes de qualidade com capitais fixos. Classificar o que é fixture de teste versus regra comercial.
5. **Assets excessivos/duplicados.** Fundos de proposta aparecem em `proposal-bg` e `proposal-v13`; ~3 MB por imagem PNG. GO markers também têm ~1,5–1,8 MB cada. Converter/otimizar e remover duplicações.
6. **HTML legado publicado em `public/legacy-pages`.** Aumenta superfície de manutenção e pode expor fluxos obsoletos. Confirmar ausência de dependência e remover da V14.
7. **Admin faz gravações diretamente do browser.** RLS ajuda, mas publicação/versionamento crítico deve usar camada de serviço/server action com validação de schema e transação.
8. **Sem schema validation explícito.** Entradas de API/configuração usam coerções manuais; adotar validação tipada no boundary.

### MÉDIO
1. `globals.css` concentra ~415 linhas e estilos de gerações diferentes; migrar para tokens + componentes/feature styles.
2. Uso misto de `next/image` e `<img>`; padronizar e definir dimensões para evitar CLS.
3. Fontes do briefing não estão integradas no layout via `next/font`; padronizar Poppins/Inter/mono.
4. Metadata pública é genérica; criar metadata por rota/produto, OpenGraph e canonical.
5. Estados de erro/loading existem globalmente, mas não estão padronizados por feature.
6. Rotas de status/quality devem ser revisadas para não revelar configuração interna além do necessário.

### BAIXO
1. Badges exibem V13 e V13.2 de forma inconsistente.
2. Nomenclatura `LocInvest/Locagora/Central` varia entre arquivos e deve ser normalizada no design system e domínio.

## Segurança
- Segredos OpenAI são referenciados apenas no servidor, o que é correto.
- Chaves `NEXT_PUBLIC_SUPABASE_*` são públicas por natureza; segurança depende de RLS.
- A senha padrão de ativação está em código cliente. Ela é tratada como gatilho de OTP, não como credencial de acesso, mas a V14 deve substituir o conceito por fluxo explícito de convite/ativação.
- RLS existente deve ser revalidada tabela a tabela antes da migração do CRM/analytics.

## Performance
- Há `next/dynamic` para módulos internos e lazy load do mapa/benchmark, evolução positiva.
- Principal oportunidade imediata: otimização/remoção de imagens PNG multi-MB e assets duplicados.
- Métricas Lighthouse/TTI/CLS não foram inferidas; precisam ser medidas em preview/produção.

## Validação executável
O ZIP não contém `node_modules` nem histórico Git. O `package.json` só fornece `dev`, `build`, `start` e `lint`; portanto não há comandos formais de typecheck/testes a executar nesta baseline. O build local V13.2 já havia sido validado pelo operador antes desta auditoria. A V14 deve adicionar comandos reproduzíveis de QA.
