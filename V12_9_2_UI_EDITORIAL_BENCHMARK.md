# V12.9.2 — UI editorial, Rede GO e Benchmark competitivo

## Escopo

- Cabeçalho visual unificado aplicado aos módulos principais da Central.
- Menu lateral redesenhado e `Soluções` renomeado para `Negócios & Investimentos`.
- LOCNEWS com carrossel automático de destaques, imagens quando disponíveis e arquivo em cards responsivos.
- API de notícias enriquecida com thumbnails RSS/YouTube e tentativa controlada de OpenGraph para os primeiros itens.
- Rede Locagora com identidade de marcador `GO`, legenda por status e marcador central da unidade selecionada sobre o Google Maps.
- Benchmark renomeado visualmente para `Inteligência Competitiva`, com resumo de fontes, leitura comercial, histórico e semântica de cores.
- Reputação: vermelho para classificação crítica/não recomendada; verde para positiva; amarelo para atenção/regular; cinza para ausência de classificação validada.
- Locagora permanece sem pontuação no Benchmark quando não houver snapshot oficial validado; ausência de fonte não é tratada como nota.
- Mantidas as correções V12.9.1 de autenticação, redirect e recuperação de senha.

## Observação sobre Google Maps

O Google Maps em modo Embed não oferece customização dos pins internos sem uso da Maps JavaScript API. Nesta versão, o marcador GO identifica cada unidade na lista e aparece centralizado sobre o mapa quando a unidade é selecionada. Para substituir todos os pins nativos simultaneamente por GO, será necessário configurar uma chave Google Maps JavaScript API em uma etapa futura.
