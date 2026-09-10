# V12.6 — Correções de homologação comercial

## Simuladores
- LocInvest: modelo, moto, ADM, rentabilidade, apropriação e capital de giro editáveis.
- EuroLoc: moto, valor, ADM, rentabilidade e capital de giro editáveis.
- Franquia Nacional: taxa de franquia livre, atalho de R$ 50 mil para franqueado, valor/modelo de moto, intermediação e giro.
- Franquia Internacional: taxa livre, atalho de R$ 50 mil, valores/modelos Brasil e Europa, intermediação e giro.
- LocMillion: quantidade de participantes e cotas percentuais editáveis.

## Jornada
Depois de finalizar/exportar ou tentar sair da proposta, aparece decisão: continuar nesta proposta ou iniciar nova. Nova proposta volta ao passo 01 e preserva os dados do consultor.

## PDF
A geração principal passa para o navegador usando `html2canvas` + `jsPDF`, que já são dependências do projeto. Cada uma das oito páginas é rasterizada e inserida em A4 paisagem com margem branca de 7 mm. O blob é então enviado ao bucket privado do Supabase. Isso reduz dependência do renderer PDF em Netlify Functions.

## IA
O endpoint mostra erro de configuração de forma diagnóstica, tenta o modelo configurado e, se necessário, `gpt-5.6-terra`. O fallback determinístico continua ativo para não bloquear a proposta.
