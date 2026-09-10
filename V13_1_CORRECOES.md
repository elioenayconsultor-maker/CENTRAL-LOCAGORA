# Locagora Central V13.1

Correções consolidadas sobre a V13:

- IA de proposta: tratamento amigável para crédito da API OpenAI esgotado, chave inválida e indisponibilidade. O fallback determinístico continua funcionando sem expor JSON bruto ao usuário.
- Proposta premium: preview atualizado para usar `public/proposal-v13` (capa + 8 páginas + contracapa), sem logo adicional na capa e com dados do consultor na página 8.
- PDF: geração no navegador em proporção 1672×941, full-bleed, sem formato A4 e sem margens brancas.
- Contracapa: sem sobreposição de texto ou logo.
- LOCNEWS: cards e carrossel passam a ter imagem de fallback editorial por categoria quando a fonte não fornece thumbnail/OG image.
- LocInvest: três opções de Taxa ADM por plano, selecionáveis pelo consultor e governadas pelo Admin.
- EUROLOC: opções de Taxa ADM por plano governadas pelo Admin, sem digitação livre de taxa pelo consultor.
- Franquia Brasil e Franquia Internacional: seleção somente entre as opções de taxa publicadas pelo Admin.
- Admin: edição das três opções de taxa do LocInvest, EUROLOC, Franquia Brasil e Franquia Internacional.
- Configuração central: nova estrutura compatível com registros antigos do Supabase; quando a configuração antiga não contém as novas listas, os valores V13.1 são usados como fallback.
- Identificação visual da versão atualizada para V13.1.

Validação no ambiente de geração: arquivos TypeScript/TSX alterados foram transpildos individualmente sem erros de sintaxe. O build Next.js completo deve ser executado no Windows após `npm install`.
