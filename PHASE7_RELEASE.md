# Locagora V14 — Fase 7

## Escopo
Fase de UX, navegação e clareza comercial sobre a Fase 6, sem alteração dos contratos de autenticação, Supabase, cálculos ou regras de negócio existentes.

## Entregas
- retorno à Central Comercial em Admin, CRM e Analytics;
- contraste e coerência visual do Admin;
- sidebar com rolagem própria em viewports menores;
- CRM com explicação dos estágios e instruções de uso;
- Analytics com explicação do funil e períodos 7/30/90 dias;
- apresentação institucional com mídia separada do texto e fallback local;
- LOCNEWS com fallback de imagem para fontes remotas indisponíveis;
- onboarding obrigatório ao entrar diretamente em `/simulador`, distinguindo franquia de investimento e esclarecendo renda recorrente projetada versus resultado variável;
- preservação da validação de e-mail e do fluxo lead → CRM → notificação da Fase 6.

## Banco
Nenhuma migration nova é necessária para a Fase 7.

## Validação no ambiente de geração
- Testes Node: executados.
- Instalação limpa (`npm ci`): bloqueada por DNS do runtime (`EAI_AGAIN registry.npmjs.org`).
- Typecheck/lint/build dependem da árvore completa de dependências; executar na estação Windows ou Vercel antes de promover.
