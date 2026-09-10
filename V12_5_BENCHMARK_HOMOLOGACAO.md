# V12.5 — Benchmark e Homologação

## Benchmark
Os dados de reputação são armazenados em `public.benchmark_snapshots`.
Cada snapshot registra fonte, URL, período, data de coleta e métricas. Isso evita apresentar pontuações sem rastreabilidade.

Foram cadastrados snapshots de referência para Mottu, O Boticário e Cacau Show referentes ao período de 01/03/2026 a 31/08/2026, conforme páginas públicas consultadas do Reclame Aqui.
A Locagora permanece sem pontuação automática até existir uma fonte/página validada para cadastro.

## Homologação
A rota `/api/quality` executa testes de sanidade dos motores:
- LocInvest
- EuroLoc
- Loc Internacional
- LocMillion
- Franquia Nacional
- Franquia Internacional
- Mini-Master
- Master Regional

Também informa se Supabase, OpenAI e NEXT_PUBLIC_APP_URL estão configurados.

Esses testes são técnicos e não substituem validação comercial/jurídica das premissas.
