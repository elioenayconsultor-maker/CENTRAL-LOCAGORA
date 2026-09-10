# Inventário de componentes — V13.2

## Shell/autenticação
- `AuthGate` — autenticação corporativa e recuperação.
- `Sidebar`, `MobileNav`, `MobileCorporateHeader` — navegação interna.
- `PublicShell` — navegação pública.
- `CommercialConfigGate` — carrega/aplica configuração comercial.

## Jornada e proposta
- `Journey`, `JourneyStepper` — fluxo comercial.
- `ProposalWorkspace`, `ProposalDeck` — proposta/preview.
- `Solutions` — seleção/apresentação interna de produtos.

## Calculadoras
- `LocInvestCalculator`
- `EuroLocCalculator`
- `LocInternacionalCalculator`
- `LocMillionCalculator`
- `FranquiaNacionalCalculator`
- `FranquiaInternacionalCalculator`
- `MiniMasterCalculator`
- `MasterRegionalCalculator`

## Conteúdo/inteligência
- `History`
- `News`
- `Benchmark`
- `Support`
- `Quality`
- `NetworkPage`, `LeafletNetworkMap`, `GoMarker`
- `TerritoryValidation`

## Público
- `PublicProductGallery`
- páginas `historia`, `negocios`, `negocios/[slug]`.

## Administração
- `AdminPanel` — configuração e PDFs; atualmente grande componente único.

## Decisão V14
### Preservar conceito, refatorar implementação
Calculadoras, Proposal Engine, rede, notícias, benchmark, autenticação Supabase, materiais públicos.

### Dividir
- `AdminPanel` em features de produtos, premissas, materiais, usuários e auditoria.
- `Journey` em lead/profile/simulation/proposal domain flows.
- `AuthGate` em sessão, autorização e telas de autenticação.

### Criar design system
`Button`, `Input`, `Select`, `Field`, `Card`, `Metric`, `Table`, `Tabs`, `Dialog`, `Drawer`, `Skeleton`, `EmptyState`, `ErrorState`, `Badge`, `PageHeader`, `AppShell`, `PublicHeader`.

### Remover após confirmação
`public/legacy-pages/*`, assets duplicados de proposta e dependências PDF legadas não utilizadas.
