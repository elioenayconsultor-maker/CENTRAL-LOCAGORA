# Locagora Central Comercial V12.1 — Consolidação Nativa

Esta versão inicia a retirada definitiva do HTML V97 incorporado.

## Mudanças desta etapa
- Remove o menu `Central Completa`.
- Remove o iframe/componente legado e os HTMLs V97 da base executável.
- A aplicação abre diretamente na Jornada Comercial.
- O portfólio `Soluções` passa a abrir a Jornada.
- A solução escolhida no portfólio é transportada para o atendimento.
- Mantém os módulos nativos: News, Jornada, Soluções, Rede e Apoio Comercial.
- Mantém autenticação Supabase, persistência, IA de proposta e PDF.

## Regra de evolução
Os recursos úteis do V97 devem ser migrados para componentes Next.js nativos.
O V97 permanece como especificação funcional de referência, não como runtime da aplicação.

## Próximas migrações
1. Validação territorial nativa para Mini Master / Master.
2. Radar/benchmark com fonte e atualização controlada.
3. Mapa operacional com coordenadas persistidas no Supabase.
4. Biblioteca de objeções administrável por gestores.
5. Proposta/closer com perfil e foto persistidos por usuário.
