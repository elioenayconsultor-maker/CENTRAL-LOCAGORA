import type { ClientProfile, ProposalNarrative, Simulation } from "./types";

export const PROPOSAL_AI_FIELDS=[
  "opportunityTitle","opportunityText","operationSummary",
  "financialNarrative","scaleNarrative","executiveSummary","closingText"
] as const;

export function deterministicNarrative(client:ClientProfile,simulation:Simulation):ProposalNarrative{
  const product=simulation.name;
  return {
    opportunityTitle:"Uma oportunidade alinhada ao perfil comercial",
    opportunityText:`A proposta considera o objetivo, a prioridade e o perfil informados por ${client.name||"o cliente"}, conectando-os à solução ${product}.`,
    operationSummary:`A estrutura apresentada segue exclusivamente a configuração validada no simulador comercial da Locagora, sem alterar premissas financeiras.`,
    financialNarrative:"Os indicadores financeiros exibidos nesta proposta são os mesmos do cenário confirmado. A leitura deve considerar operação, contrato, tributos, liquidez e demais condições aplicáveis.",
    scaleNarrative:"O potencial de evolução depende das regras específicas da solução, da capacidade operacional e das condições comerciais aprovadas.",
    executiveSummary:`O cenário consolida a solução ${product} em uma visão única para apoiar a decisão comercial e a etapa de formalização.`,
    closingText:"O próximo passo é validar a condição comercial, revisar a documentação definitiva e confirmar a implantação conforme o produto selecionado."
  };
}

const prohibited=[
  /garantid[oa]/i,/sem\s+risco/i,/retorno\s+certo/i,/lucro\s+garantido/i,
  /rentabilidade\s+garantida/i,/ganho\s+garantido/i,/resultado\s+garantido/i
];

export function validateNarrative(n:ProposalNarrative){
  const errors:string[]=[];
  for(const key of PROPOSAL_AI_FIELDS){
    const value=String(n?.[key]??"").trim();
    if(!value)errors.push(`${key}: vazio`);
    if(value.length>900)errors.push(`${key}: texto muito longo`);
    // The AI narrative is intentionally prevented from introducing any
    // numbers. All numbers remain rendered by deterministic components.
    if(/\d/.test(value))errors.push(`${key}: contém números`);
    if(prohibited.some(rx=>rx.test(value)))errors.push(`${key}: contém promessa vedada`);
  }
  return {ok:errors.length===0,errors};
}
