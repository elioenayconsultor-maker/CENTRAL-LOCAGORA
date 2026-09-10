# V13.2 — Refatoração visual e performance

## Escopo implementado
- Design tokens Cool Greys + Accent Blue.
- Poppins para títulos e Inter para UI/corpo via Google Fonts, com fallbacks de sistema.
- Sidebar clara, sem divisores rígidos e com estado ativo por barra verde.
- PageHero e heróis de calculadoras sem background azul denso.
- Cards sem bordas rígidas; elevação restrita a shadows leve/média.
- Jornada Comercial em grid responsivo, com campos touch-friendly e labels flutuantes.
- Inputs, selects e botões com altura mínima de 44px.
- Tabelas sem gridlines verticais e números com fonte monospace.
- Code splitting por módulo com `next/dynamic`.
- Mapa Leaflet carregado sob demanda.
- Benchmark posterga gráficos em 2s e usa skeleton shimmer.
- Skeleton global para módulos carregados dinamicamente.
- Breakpoints revisados para mobile (<768), tablet (768–1024) e desktop.
- Respeito a `prefers-reduced-motion`.

## Observações de aceite
Os alvos Lighthouse >=85, TTI <3s em Slow 4G e CLS <0.1 dependem também de rede, cache, Vercel, APIs externas, quantidade/peso de imagens e dispositivo. O código foi preparado para esses objetivos, mas os números devem ser medidos na URL de produção após deploy.

## Commits sugeridos para repositório Git
1. `refactor(ui): introduce v13.2 design tokens and minimal shell`
2. `refactor(journey): add responsive floating-label commercial form`
3. `perf(app): split heavy modules and lazy-load network map`
4. `perf(benchmark): add delayed charts and skeleton states`
5. `docs(v13.2): document visual system and performance acceptance`
