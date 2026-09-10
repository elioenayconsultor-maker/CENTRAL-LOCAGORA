# Locagora Central V13

Base: V12.9.5 - Historia + Inteligencia Competitiva.

## Entregas V13

- Portal publico sem senha em `/historia` e `/negocios`.
- Paginas publicas por produto com apresentacoes responsivas e suporte a PDF publicado via Supabase.
- Area corporativa preservada com autenticacao existente.
- Painel `/admin` para atualizar parametros comerciais globais e substituir PDFs publicos.
- Configuracao central publicada no Supabase e aplicada antes de montar os simuladores.
- Auditoria de alteracoes de configuracao e Storage publico controlado por RLS.
- Primeiro administrador pode ativar o proprio perfil uma unica vez (somente dominio corporativo).
- V13 visivel ao lado da marca na Central e no portal publico.
- Navegacao mobile com barra inferior, menu "Mais" e header compacto.
- Regras responsivas para cards, grids, tabelas, mapa, LOCNEWS, apoio comercial e simuladores.
- Manifesto PWA e icones de instalacao.
- Gerador de proposta redesenhado para 10 paginas 16:9, full bleed: capa + 8 paginas + contracapa.
- Capa e contracapa nao recebem logos adicionais; contracapa nao recebe qualquer sobreposicao.
- Pagina 8 finaliza com os dados do consultor.

## Banco de dados

Aplicar a migration:

`supabase/migrations/20260907_v13_admin_public_portal.sql`

Ela cria configuracao, administradores, auditoria, documentos publicos e o bucket `commercial-public-docs`.

## Observacao de versionamento

Parametros publicados afetam novos acessos e novas simulacoes. Propostas ja geradas continuam sendo documentos historicos e nao sao recalculadas retroativamente.
