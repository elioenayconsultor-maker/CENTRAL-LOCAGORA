# Locagora Central V14 — V8.2

## Mudanças
- Entrada pública preservada como experiência do cliente.
- Nova rota `/acesso` para entrada corporativa; botões “Sou colaborador”, “Área corporativa” e “Acesso corporativo” apontam para esse fluxo.
- Usuário sem sessão vê autenticação corporativa; usuário já autenticado recebe confirmação e segue para a Central.
- Onboarding do `/simulador` reorganizado em duas famílias: Franquia e Investimento.
- Franquia: Franquia Brasil, Franquia Internacional, Franquia 2x1 Brasil x Europa, Master e Mini-Master.
- Investimento: LocInvest, LocMillion, EUROLOC — LocInvest Espanha e Cotas — Locagora Europa + México.
- LocInvest mantém simulação pública imediata baseada somente nas premissas publicadas.
- Demais modelos possuem páginas públicas específicas de apresentação e encaminhamento para simulação personalizada, sem expor motores corporativos internos.
- Nenhuma migration nova é necessária nesta versão.

## Validação
- Typecheck: aprovado usando a árvore de dependências local validada.
- Lint: 0 erros; 85 warnings preexistentes da baseline permanecem.
- Testes: 20/20 aprovados, incluindo regressões das fases anteriores e testes V8.2.
- Build Linux deste ambiente: bloqueado exclusivamente pela ausência do binário SWC Linux; validar `npm run build` no Windows/Vercel.
