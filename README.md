## V12.9.5 — História + Inteligência Competitiva

# Locagora Central Comercial — V12

> **Base única a partir de 05/09/2026.** Não reaplique patches V10/V11 sobre esta versão.

Consulte `V12_PROFISSIONAL.md` para configuração, deploy e escopo consolidado.

# Locagora Central — migração para Next.js + TypeScript

Esta é a base nova da Central Comercial.

## Stack
- Next.js
- React
- TypeScript
- CSS próprio / Design System Locagora
- jsPDF + html2canvas preparados para a etapa de PDF

## O que já está convertido
- Shell global / menu lateral
- Locagora News (hero + redes sociais)
- Jornada Comercial em 5 etapas
- Perfil do cliente
- Filtro de soluções por capital e perfil de renda
- Estado comercial único e tipado
- Migração automática de dados do localStorage antigo
- Seleção de produto
- Simulação de referência
- Confirmação
- Proposta básica
- Rede / Soluções / Apoio como módulos React
- Projeto responsivo

## Compatibilidade
O arquivo `public/legacy-v97.html` foi incluído como referência integral da versão anterior.
Cada página antiga também foi exportada para `public/legacy-pages/`.

## Próxima etapa recomendada
Migrar, uma a uma, as regras completas das 8 calculadoras para módulos TypeScript:
1. LocInvest
2. EUROLOC
3. Cotas LocInternacional
4. LocMillion
5. Franquia Nacional
6. Internacional 2 em 1
7. Mini-Master
8. Master Regional

Depois:
- proposta premium de 8 páginas
- PDF servidor/browser
- mapa Leaflet
- feed News
- Supabase


## V2 — LocInvest migrado
O LocInvest agora é um módulo React/TypeScript nativo, sem usar DOM imperativo da versão legada.

Inclui:
- planos Start, Premium e Exclusive;
- vínculo plano ↔ quantidade;
- composição automática por capital;
- regra de não combinar Start com Exclusive;
- opções individuais elegíveis;
- capital de giro;
- KPIs de renda/ROI;
- base econômica mensal;
- distribuição Investidor x Locagora;
- projeção de 12 anos com IPCA e renovações em 36 meses;
- comparativo ilustrativo Selic/CDI;
- envio direto da simulação para a etapa Confirmação/Proposta.


## V3 — EUROLOC migrado
O EUROLOC agora também é React/TypeScript nativo.

Inclui:
- planos Start, Exclusive, Premium e Black;
- faixas 1–15 motos;
- rentabilidade por plano;
- Honda PCX como modelo da frota;
- três opções de Taxa ADM por plano;
- recomendação automática pelo capital;
- valor utilizado e devolução ao cliente;
- equivalência BRL/EUR com câmbio editável;
- ROI mensal e anual simples;
- tabela de configurações elegíveis;
- países do Movimento EuroLoc;
- hub Barcelona / porta de entrada Portugal;
- calendário de suporte europeu;
- envio direto para Confirmação e Proposta.


## V4 — Cotas LocInternacional + LocMillion migrados

### Cotas LocInternacional
- capital direto;
- mínimo de R$ 100 mil;
- 1,5% a.m. a partir de R$ 100 mil;
- 2,0% a.m. a partir de R$ 200 mil;
- taxa negociada acima da base;
- projeção mensal, anual e 13 meses;
- envio para Confirmação/Proposta.

### LocMillion
- projeto total de R$ 1 milhão;
- R$ 900 mil em ativos;
- R$ 50 mil ADM;
- R$ 50 mil ativação/segurança;
- 45 motos;
- renda de R$ 25 mil/mês;
- investidor único ou grupo;
- participação proporcional por aporte;
- renda, ROI, payback e liquidez por investidor;
- eventos de liquidez nos anos 3, 6 e 9;
- IPCA editável;
- base de liquidez de R$ 900 mil preservada.


## V5 — Franquia Nacional + Internacional 2 em 1 migradas

### Franquia Nacional Exclusive
- taxas de franquia R$ 79.990 / R$ 74.990 / R$ 69.999;
- moto a R$ 16.990;
- intermediação de R$ 4.000/moto;
- capital de giro padrão de R$ 600/moto;
- DRE em quatro fases até 36 meses;
- manutenção progressiva;
- royalties de 6% sobre locação;
- marketing, sistema, contabilidade e tributos;
- venda da moto em referência por R$ 17 mil no mês 36;
- ROI e payback simples;
- sem comissões.

### Franquia Internacional 2 em 1
- taxas de franquia R$ 119.990 / R$ 104.990 / R$ 97.000;
- Brasil + Europa;
- seleção de modelos;
- DRE internacional escalável por quantidade;
- base de € 3.320 de receita / € 1.108,80 de despesas em 10 motos;
- conversão EUR/BRL editável;
- margem líquida;
- sem comissões.


## V6 — Mini-Master + Master Regional migrados

### Mini-Master
- investimento de referência de R$ 380 mil;
- R$ 300 mil de taxa + R$ 80 mil de estrutura;
- sem compra de frota pela Mini-Master;
- frota pertencente à matriz;
- cidades de até 400 mil habitantes;
- capacidade de 300 motos;
- 5 colaboradores iniciais;
- referência de 20–25 franqueados;
- DRE maduro com receita e despesas do modelo atual;
- lucro líquido de referência de R$ 23.208/mês em 300 motos;
- payback simples maduro de ~16,4 meses;
- referência comercial de payback projetado em 20 meses;
- parâmetros de moto própria R$ 1.300 e terceiros R$ 250;
- participação de oficina e pagamento Locagora configuráveis;
- validação territorial preliminar.

### Master Regional
- investimento de referência de R$ 928 mil;
- elegibilidade acima de 400 mil habitantes;
- contrato de 10 anos;
- royalties, marketing e sistema em 0%;
- metas de 6, 12 e 24 meses;
- 30 / 50 / 80 franqueados;
- 300 / 600 / 1.000 motos;
- receitas mensais de referência R$ 19,9 mil / R$ 39,6 mil / R$ 81 mil;
- regras de repasse comercial exibidas;
- ROI e payback simples;
- validação territorial preliminar.

## Status da migração
Os 8 motores comerciais principais agora estão em módulos TypeScript:
1. LocInvest
2. EUROLOC
3. Cotas LocInternacional
4. LocMillion
5. Franquia Nacional Exclusive
6. Franquia Internacional 2 em 1
7. Mini-Master
8. Master Regional

Próxima fase: proposta premium de 8 páginas, PDF, mapa de rede, News e backend/Supabase.

## V7 - Proposta premium e PDF
- proposta nativa React/TypeScript com 8 paginas;
- dados puxados diretamente da simulacao confirmada;
- ganho mensal exibido antes do investimento;
- campos obrigatorios de titulo, data, validade, consultor e WhatsApp;
- backgrounds oficiais horizontalizados mantidos como assets externos;
- paginas: capa, oportunidade, estrutura, ativos, projecao financeira, escala, resumo executivo e conclusao;
- regras genericas para os 8 produtos migrados;
- CSS de impressao em landscape com uma pagina por folha;
- botao Gerar PDF usa o mecanismo de impressao do navegador sem dependencias CDN;
- sem html2canvas/jsPDF no fluxo novo.


## V8 — Supabase + persistência + PDF server-side + APIs de Rede/News

Implementado no código:
- cliente Supabase para browser e server;
- configuração do projeto `CENTRAL LOCAGORA V4`;
- publishable key via variável de ambiente;
- repositório de persistência para jornada, simulações e propostas;
- migration SQL versionada em `supabase/migrations/20260905_commercial_hub.sql`;
- RLS desenhada sobre `current_app_user_id()` e permissões existentes do CRM;
- geração de PDF de 8 páginas no servidor com `@react-pdf/renderer`;
- endpoint `/api/proposal/pdf`;
- endpoint `/api/network`;
- endpoint `/api/news`;
- indicador de conexão Supabase no menu;
- fallback local preservado.

### Importante
A migration foi adicionada ao repositório, mas deve ser aplicada após revisão/execução no Supabase. A tentativa de aplicação automática desta sessão foi bloqueada pela camada de segurança da ferramenta, então a V8 não presume que as três novas tabelas já existam no banco.

### Variáveis
Copie `.env.example` para `.env.local`.
A chave usada no frontend é publishable, não service-role.

### Próximas conexões
1. autenticação/tela de login usando `auth.users` + `public.users`;
2. chamar `saveRemoteSimulation` ao salvar uma simulação;
3. chamar `saveRemoteProposal` ao gerar uma proposta;
4. salvar o PDF no bucket privado após a migration;
5. alimentar `/api/network` com a base territorial oficial;
6. alimentar `/api/news` com RSS/APIs oficiais e cache server-side.


## V9 — Agente de proposta com IA + circuito comercial fechado

- OpenAI Responses API com Structured Outputs em `/api/proposal/ai`;
- modelo padrão `gpt-5.6-terra`, configurável por `OPENAI_PROPOSAL_MODEL`;
- `OPENAI_API_KEY` somente no servidor;
- IA restrita à narrativa, com números bloqueados e validação anti-promessas;
- fallback determinístico seguro;
- login Supabase por e-mail/senha;
- autosave da jornada;
- persistência de sessão, simulação e proposta;
- PDF server-side e upload em bucket privado;
- histórico do cliente e URL assinada para PDFs;
- migration completa em `supabase/migrations/20260905_commercial_hub.sql`.

Para ativar a IA, defina `OPENAI_API_KEY` em `.env.local`. Nunca prefixe essa chave com `NEXT_PUBLIC_`.

## V10 — ativação corporativa @locgrupo.com.br

Fluxo de primeiro acesso:
1. usuário informa e-mail `@locgrupo.com.br` e a senha padrão corporativa;
2. a senha padrão é somente um gatilho e nunca cria sessão de acesso;
3. a Central envia um magic link/OTP de confirmação pelo Supabase Auth;
4. o usuário precisa abrir o próprio e-mail corporativo e confirmar;
5. `/auth/confirm` conclui o fluxo PKCE/OTP;
6. o usuário é direcionado para `/account/update-password` e obrigado a criar senha pessoal com no mínimo 10 caracteres;
7. a RPC `activate_corporate_access()` vincula o `auth.users.id` ao registro de `public.users` pelo e-mail;
8. somente perfil existente e `active=true` no CRM recebe acesso;
9. perfis ausentes, inativos ou já vinculados a outra credencial ficam bloqueados.

A senha padrão nunca deve ser armazenada como segredo do usuário nem permanecer como senha final.


## V10.2
- Logo oficial no login, sidebar e proposta.
- Navegação corrigida e labels protegidos contra mojibake.
- Locagora News via Google News RSS: Locagora, investimentos, concorrentes, Portugal e Espanha.
- Benchmark Reclame Aqui migrado da versão legada (referência 01/03/2026–31/08/2026) com links de fonte.
- Rede Brasil + Europa com endereços e links OpenStreetMap.
- Biblioteca de objeções migrada.
- Foto do consultor na proposta e reposicionamento do bloco final.
- Soluções clicáveis e IA preservada.


## V13.2
Refatoração visual minimalista e performance. Consulte `V13_2_VISUAL_PERFORMANCE.md`.
