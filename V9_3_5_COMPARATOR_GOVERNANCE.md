# Central LOC — V9.3.5 — Governança do Comparador

## Objetivo
Fechar a governança das premissas financeiras usadas no comparador comercial, distinguindo referências oficiais automáticas de premissas administrativas e preservando rastreabilidade para proposta/PDF.

## Fontes oficiais automáticas
- CDI: Banco Central / SGS 4389.
- Selic: Banco Central / SGS 1178.
- IPCA 12 meses: Banco Central / SGS 13522.

Estas referências continuam sendo carregadas pela rota `/api/market-reference-rates` e não devem ser substituídas manualmente pelo consultor quando a fonte oficial estiver disponível.

## Premissas administrativas
As seguintes chaves permanecem sob governança administrativa, sem valores fictícios:
- `IPCA_PLUS_REAL` — prêmio/taxa real usado para compor o Tesouro IPCA+.
- `FII_DY` — dividend yield de referência para FII.
- `FII_APPRECIATION` — valorização estimada de FII quando utilizada.
- `PROPERTY_RENT_YIELD` — aluguel líquido de referência para imóvel.
- `PROPERTY_APPRECIATION` — valorização estimada de imóvel quando utilizada.
- `FRANCHISES_SOLD` — indicador administrativo.

## Auditoria
Migration aplicada no Supabase: `commercial_v9_3_5_market_assumption_audit`.

Ela cria `commercial_market_assumption_audit` e registra alterações de valor, fonte e data de referência em `commercial_market_assumptions`, incluindo usuário responsável quando disponível e timestamp.

## Snapshot comercial
A seleção de cenário continua gravando `assumptions_snapshot` e `taxation_snapshot`. O snapshot deve ser tratado como registro histórico do cenário apresentado ao cliente; mudanças posteriores nas premissas não devem recalcular uma proposta já congelada.

## Regras de UI para a próxima tela ADM
1. Consultor: leitura das premissas publicadas; sem edição de taxa de mercado no comparador.
2. ADM: edição de premissas administrativas com fonte, data de referência e justificativa/metadados.
3. Valores nulos permanecem como `N/D`/aguardando premissa; nunca preencher automaticamente com estimativa inventada.
4. Exibir origem e data junto da taxa utilizada.
5. Antes de publicar uma alteração, mostrar o impacto e exigir confirmação.

## Jornada alvo
Fluxo comercial consolidado:
`Solução → Simulação → Diagnóstico/Comparador → Cliente → Confirmação → Proposta/PDF`.

O comparador pré-cliente é a seleção canônica; não deve ser repetido depois do cadastro do cliente.

## Critérios de homologação V9.3.5
- CDI/Selic/IPCA oficiais continuam automáticos.
- Premissas ADM não podem ser confundidas com fonte oficial.
- Alterações administrativas geram trilha de auditoria.
- Cenário selecionado preserva premissas e tributação no snapshot.
- Proposta/PDF usa o snapshot selecionado, sem recalcular silenciosamente com taxas posteriores.
- Valores administrativos ausentes permanecem explicitamente indisponíveis.
