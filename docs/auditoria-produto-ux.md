# Auditoria de produto e UX — baseline V13.2

## Diagnóstico
A V13.2 já possui dois conceitos corretos: conteúdo público (`/historia`, `/negocios`) e Central corporativa autenticada. Entretanto, a home `/` ainda é essencialmente a Central interna e o portal público não constitui uma jornada completa de aquisição/conversão.

## Problemas prioritários
### Críticos/altos
- Visitante não tem landing pública principal com proposta de valor + CTA “Encontrar meu modelo”.
- Não existe jornada guiada pública de recomendação de produto.
- Não existe simulador público progressivo com cenários e versão de premissas.
- Conversão não entrega lead estruturado ao closer com contexto completo da simulação.
- Área closer não possui dashboard/CRM/follow-up próprios como experiência coesa.
- Portal público usa apresentações visuais, mas a V14 precisa garantir que informação essencial também exista em HTML acessível.

## Mobile
A V13.2 introduziu navegação mobile e design responsivo, porém a reconstrução deve ser validada em 375/768/1024/1440 px por rota. Tabelas, mapas, PDFs e gráficos devem ter apresentações alternativas em telas estreitas, não apenas redução de escala.

## Arquitetura de experiência proposta
1. `/` — landing pública.
2. `/historia` — história acessível e visual.
3. `/negocios` — portfólio filtrável/comparável.
4. `/encontrar-modelo` — recomendador guiado.
5. `/simular` e `/simular/[produto]` — simulador orientativo.
6. `/contato` / agendamento — conversão com contexto.
7. `/app` — workspace autenticado do closer.
8. `/admin` — administração versionada.

## Princípios
- Login somente quando necessário para operação interna.
- Mostrar valor antes de pedir dados pessoais.
- Nunca usar promessa financeira; cenários dependem de premissas aprovadas.
- Fonte, período e versão visíveis em indicadores comerciais.
- PDFs são material complementar; nunca a única fonte de informação.
