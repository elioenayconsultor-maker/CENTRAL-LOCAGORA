# Central LOC — V9.3.4

## Taxas automáticas no comparador

Esta fase conecta o Comparador de Oportunidades a referências oficiais do Banco Central do Brasil, sem inserir taxas fictícias no frontend.

### Referências automáticas

- Selic: SGS 1178 — taxa anualizada base 252.
- CDI: SGS 4389 — taxa anualizada base 252.
- IPCA: SGS 13522 — acumulado em 12 meses.

As referências carregam valor, fonte e data-base. O endpoint aplica cache de 6 horas e tolerância stale-while-revalidate de 24 horas.

### Tesouro IPCA+

O sistema não inventa a taxa real do título. Quando existe `IPCA_PLUS_REAL` publicado pelo ADM, o comparador combina esse valor com o IPCA de 12 meses usando a composição nominal:

`(1 + IPCA) * (1 + taxa real) - 1`

O snapshot selecionado registra IPCA, taxa real e taxa efetiva calculada, incluindo a metodologia.

### FII e imóvel

FII e imóvel para renda permanecem como premissas administrativas, pois não existe uma taxa oficial única equivalente à Selic ou ao CDI para essas classes.

### Arquivos da fase

- `app/api/market-reference-rates/route.ts`
- `components/CapitalOpportunityComparator.tsx`
- `tests/v9_3_4_auto_market_rates.test.mjs`

### Segurança e governança

- Nenhuma credencial é adicionada ao código.
- Nenhuma taxa tributária é inventada.
- A proposta mantém o snapshot das premissas escolhidas.
- A produção não deve ser alterada antes da homologação do Preview.
