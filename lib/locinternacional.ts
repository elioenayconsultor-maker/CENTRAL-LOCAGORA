export interface LocInternacionalResult {
  capital:number;
  baseRate:number;
  appliedRate:number;
  monthly:number;
  annual:number;
  months13:number;
  roi13:number;
}

export function locInternacionalBaseRate(capital:number){
  const c=Math.max(0,Number(capital)||0);
  if(c<100000)return 0;
  return c>=200000?2:1.5;
}

export function calculateLocInternacional(
  capital:number,
  customRate?:number
):LocInternacionalResult{
  const c=Math.max(0,Number(capital)||0);
  const baseRate=locInternacionalBaseRate(c);
  const requested=Number(customRate||0);
  const appliedRate=baseRate?Math.max(baseRate,requested||baseRate):0;
  const monthly=c*(appliedRate/100);
  const annual=monthly*12;
  const months13=monthly*13;
  return {
    capital:c,baseRate,appliedRate,monthly,annual,months13,
    roi13:c?months13/c*100:0
  };
}

export function locInternacionalEligible(capital:number){
  return Number(capital)>=100000;
}
