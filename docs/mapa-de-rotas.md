# Mapa de rotas

## Baseline V13.2
| Rota | Tipo | Observação |
|---|---|---|
| `/` | corporativa | SPA interna protegida por AuthGate |
| `/historia` | pública | apresentação institucional |
| `/negocios` | pública | catálogo |
| `/negocios/[slug]` | pública | apresentação por produto |
| `/admin` | protegida | AuthGate + checagem admin no cliente/RLS |
| `/account/update-password` | auth | redefinição de senha |
| `/auth/confirm` | auth | callback |
| `/api/news` | API | notícias |
| `/api/network` | API | rede |
| `/api/territory` | API | território |
| `/api/benchmark/live` | API | benchmark |
| `/api/proposal/ai` | API | narrativa IA |
| `/api/proposal/pdf` | API | PDF |
| `/api/support/ai` | API | apoio comercial IA |
| `/api/quality` | API | diagnóstico |
| `/api/system/status` | API | status |

## Alvo V14
### Público
- `/`
- `/historia`
- `/negocios`
- `/negocios/[slug]`
- `/comparar`
- `/encontrar-modelo`
- `/simular`
- `/simular/[slug]`
- `/contato`

### Corporativo
- `/app`
- `/app/leads`
- `/app/leads/[id]`
- `/app/simulacoes/[id]`
- `/app/materiais`
- `/app/apoio`
- `/app/tarefas`
- `/app/benchmark`
- `/app/rede`

### Administração
- `/admin`
- `/admin/produtos`
- `/admin/premissas`
- `/admin/conteudos`
- `/admin/materiais`
- `/admin/usuarios`
- `/admin/auditoria`

### Regra
Rotas protegidas devem validar sessão e papel no servidor; UI oculta não substitui autorização.
