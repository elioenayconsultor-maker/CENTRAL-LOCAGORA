# Locagora Central Comercial V12 — Base de Estabilização

Esta versão consolida a V10.2, os ajustes livres do EuroLoc da V10.3, a integração funcional do V97 da V11 e a identidade visual oficial em uma única base.

## Objetivo da V12

A V12 é a nova fonte única do projeto. A partir dela, não se deve reaplicar ZIPs antigos nem patches V10/V11. Novas mudanças devem partir desta pasta.

## Módulos consolidados

- Login corporativo `@locgrupo.com.br` com ativação por e-mail e troca obrigatória de senha.
- Auto-vínculo do usuário autenticado ao registro correspondente do CRM.
- Central Completa V97 integrada para preservar todas as ferramentas do esboço durante a migração nativa.
- Jornada Comercial.
- Soluções e simuladores: LocInvest, EuroLoc, LocAgora Internacional, LocMillion, Franquia Nacional, Franquia Internacional, Mini Master e Master Regional.
- EuroLoc com taxa ADM, modelo/valor da moto e rentabilidade ajustáveis pelo consultor.
- Locagora News / inteligência comercial.
- Rede Locagora Brasil e Europa.
- Apoio Comercial / objeções e argumentos.
- Proposta comercial com narrativa por IA, PDF e persistência Supabase.
- Histórico de sessões, simulações e propostas.
- Logo oficial unificada no acesso e na navegação.
- Tela global de erro e estado de carregamento.

## Configuração obrigatória de produção

### Netlify

Defina as variáveis abaixo no contexto de produção:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_PROPOSAL_MODEL`

Nunca exponha `OPENAI_API_KEY` em variável `NEXT_PUBLIC_*`.

### Supabase Auth

Em Authentication > URL Configuration:

- mantenha a Site URL usada pelos demais sistemas conforme necessário;
- adicione `https://locinvestcalculator.netlify.app/**` em Redirect URLs.

A Central envia explicitamente o retorno de ativação para:

`https://locinvestcalculator.netlify.app/auth/confirm?next=/account/update-password`

O template de confirmação/magic link deve usar a URL gerada pelo Supabase, e não um endereço fixo do CRM.

### Banco

As migrations da pasta `supabase/migrations` fazem parte desta base. No projeto atual elas já foram aplicadas, mas devem permanecer versionadas para novos ambientes.

## Publicação recomendada

```powershell
npm install
npm run build
npx netlify-cli@latest link --id eeb0bdfc-fe2a-4bd3-b4c9-2f2a0d3a77bd
npx netlify-cli@latest deploy --prod --build
```

## Critério profissional

A V12 é uma base de estabilização, não o fim da migração. O V97 permanece incorporado na aba “Central Completa” para não perder funcionalidades. A etapa seguinte é substituir gradualmente cada área do V97 por componentes Next.js nativos, mantendo a V12 como fonte única e testável.
