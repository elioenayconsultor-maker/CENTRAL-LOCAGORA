CENTRAL LOC — V9.3.1 INTELIGÊNCIA DE MERCADO

Objetivos desta correção:
1. Corrigir fontes escuras/baixo contraste no Comparador de Capital.
2. Formatar Capital e Renda com separador de milhar pt-BR durante a digitação.
3. Preencher CDI e Selic automaticamente pelo Banco Central (SGS 4389 e 1178).
4. Carregar IPCA+, FII e Imóvel automaticamente das premissas publicadas pelo ADM.
5. Incluir LocAgora Veículos, Mottu e Loca9motos no Benchmark/Reclame Aqui.
6. Mostrar número de franquias vendidas no Benchmark.
7. Permitir ao ADM atualizar franquias manualmente ou por uma fonte JSON automática.

IMPORTANTE — SQL:
Execute manualmente no Supabase SQL Editor:
supabase/migrations/20260910_v9_3_1_market_intelligence.sql

NÃO executar db push, db reset ou migration repair.

Depois copie os arquivos para a raiz do projeto e rode:
npm run typecheck
npm test
npm run build
npx vercel --prod

FONTE AUTOMÁTICA DE FRANQUIAS:
O modo external_json espera uma URL HTTPS que devolva JSON com um dos campos:
franchises_sold, sold_franchises, value ou data.value.
Sem uma fonte oficial configurada, o ADM mantém o número manualmente.
