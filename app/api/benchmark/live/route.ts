export const dynamic="force-dynamic";

type RaData={company:string;reputation:string;score:number|null;complaints:number|null;answeredPct:number|null;pending:number|null;evaluated:number|null;consumerScore:number|null;wouldReturnPct:number|null;resolutionPct:number|null;avgResponse:string|null;period:string;source:string;live:boolean;fetchedAt:string};
const SOURCES=[
 {company:"Locagora",url:"https://www.reclameaqui.com.br/empresa/locagora-veiculos/",fallback:{reputation:"Boa",score:7.3,complaints:617,answeredPct:99.7,pending:1,evaluated:343,consumerScore:6.12,wouldReturnPct:61.2,resolutionPct:74.6,avgResponse:"5 dias e 11 horas",period:"01/03/2026 a 31/08/2026"}},
 {company:"Mottu",url:"https://www.reclameaqui.com.br/empresa/mottu/lista-reclamacoes/",fallback:{reputation:"Não recomendada",score:null,complaints:3726,answeredPct:0,pending:2838,evaluated:888,consumerScore:null,wouldReturnPct:null,resolutionPct:null,avgResponse:null,period:"01/03/2026 a 31/08/2026"}}
];
function num(t:string|undefined){if(!t)return null;const n=Number(t.replace(/\./g,"").replace(",","."));return Number.isFinite(n)?n:null}
function pick(html:string,re:RegExp){return html.match(re)?.[1]?.trim()}
async function readOne(s:typeof SOURCES[number]):Promise<RaData>{
 const fetchedAt=new Date().toISOString();
 try{
  const r=await fetch(s.url,{cache:"no-store",headers:{"User-Agent":"Mozilla/5.0 (compatible; LocagoraCentral/1.0)"},signal:AbortSignal.timeout(8000)}); if(!r.ok)throw new Error(String(r.status));
  const html=(await r.text()).replace(/&nbsp;/g," ").replace(/\s+/g," ");
  const reputation=pick(html,/Reputa(?:ç|c)ão\s+(?:da empresa\s+)?(?:Boa|Bom|Não recomendada|Nao recomendada|Regular|Ótima|Otima)/i)?.replace(/^.*Reputa(?:ç|c)ão\s+(?:da empresa\s+)?/i,"")||pick(html,/Reputa(?:ç|c)ão\s+(Boa|Bom|Não recomendada|Nao recomendada|Regular|Ótima|Otima)/i)||s.fallback.reputation;
  const score=num(pick(html,/nota média nos últimos 6 meses (?:é|e)\s*([\d,.]+)\/10/i));
  const complaints=num(pick(html,/recebeu\s+([\d.]+)\s+reclama/i));
  const answeredPct=num(pick(html,/Respondeu\s+([\d,.]+)%/i));
  const pending=num(pick(html,/Há\s+([\d.]+)\s+reclama(?:ç|c)ão aguardando/i));
  const evaluated=num(pick(html,/Há\s+([\d.]+)\s+reclama(?:ç|c)ões avaliadas/i));
  const consumerScore=num(pick(html,/nota média dos consumidores\s*(?:é|e)\s*([\d,.]+)/i));
  const wouldReturnPct=num(pick(html,/([\d,.]+)%\s+voltariam a fazer negócio/i)||pick(html,/Dos que avaliaram,\s*([\d,.]+)%/i));
  const resolutionPct=num(pick(html,/resolveu\s+([\d,.]+)%/i));
  const avgResponse=pick(html,/tempo médio de resposta\s*(?:é|e)\s*([^.<]+(?:horas|minutos|dias))/i)||s.fallback.avgResponse;
  const period=pick(html,/Dados de\s*([^<]{5,60})/i)||pick(html,/dados correspondem ao período de\s*([^<]{5,60})/i)||s.fallback.period;
  const live=Boolean(complaints!==null||answeredPct!==null||score!==null);
  return {company:s.company,reputation,score:score??s.fallback.score,complaints:complaints??s.fallback.complaints,answeredPct:answeredPct??s.fallback.answeredPct,pending:pending??s.fallback.pending,evaluated:evaluated??s.fallback.evaluated,consumerScore:consumerScore??s.fallback.consumerScore,wouldReturnPct:wouldReturnPct??s.fallback.wouldReturnPct,resolutionPct:resolutionPct??s.fallback.resolutionPct,avgResponse,period,source:s.url,live,fetchedAt};
 }catch{return {company:s.company,...s.fallback,source:s.url,live:false,fetchedAt};}
}
export async function GET(){const data=await Promise.all(SOURCES.map(readOne));return Response.json({data,generatedAt:new Date().toISOString(),note:"Quando a fonte não responde, a Central exibe o último snapshot validado e marca como fallback."},{headers:{"Cache-Control":"no-store"}})}
