# V12.7.1 — Revisão do Modo Apresentação

## Problema encontrado
A V12.7 original declarava `saveLabel?: string` no tipo do `LocInvestCalculator`, mas não recebia `saveLabel` na desestruturação do componente. Isso causava `Cannot find name 'saveLabel'`.

## Correções adicionais de fluxo
- Todos os oito simuladores foram conferidos para o botão dinâmico.
- Ao clicar em **Gerar proposta** em Soluções, a simulação escolhida é preservada.
- A Jornada abre no passo 01 para um novo cliente.
- Dados de cliente do atendimento anterior não são reutilizados por engano.
- Simulações de atendimentos anteriores não são misturadas com a nova proposta.
- A simulação pendente só é removida depois de concluir o cadastro do cliente.
- Ao iniciar **Nova proposta**, os marcadores temporários do modo apresentação são removidos.

## Fluxo final
Soluções → Simular livremente → Gerar proposta → Passo 01 / cadastrar cliente → Confirmar cenário → Proposta.
