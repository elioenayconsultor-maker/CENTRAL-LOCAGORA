import { calculateLocInvest, projectLocInvest } from "@/lib/locinvest";
import { calculateEuroLoc, recommendEuroLocByCapital } from "@/lib/euroloc";
import { calculateLocInternacional } from "@/lib/locinternacional";
import { calculateLocMillion } from "@/lib/locmillion";
import { calculateNationalFranchise } from "@/lib/franquia-nacional";
import { calculateInternationalDre, calculateInternationalInvestment } from "@/lib/franquia-internacional";
import { calculateMiniMaster } from "@/lib/mini-master";
import { calculateMasterRegional } from "@/lib/master-regional";

type Check={name:string;ok:boolean;detail:string};

function finite(name:string,value:number):Check{
 return {name,ok:Number.isFinite(value)&&value>=0,detail:String(value)};
}

export async function GET(){
 const checks:Check[]=[];
 try{
   const a=calculateLocInvest(350000); checks.push(finite("LocInvest mensal",a.monthly),finite("LocInvest investido",a.invested));
   checks.push({name:"LocInvest projeção 12 anos",ok:projectLocInvest(350000).rows.length===12,detail:String(projectLocInvest(350000).rows.length)});
   const e=calculateEuroLoc("black",13,16000); checks.push(finite("EuroLoc total",e.total),finite("EuroLoc mensal",e.monthly));
   checks.push({name:"EuroLoc recomendação",ok:Boolean(recommendEuroLocByCapital(350000)),detail:recommendEuroLocByCapital(350000)?.label||"null"});
   const li=calculateLocInternacional(200000); checks.push(finite("Loc Internacional mensal",li.monthly));
   const lm=calculateLocMillion(); checks.push(finite("LocMillion mensal",lm.monthly));
   const fn=calculateNationalFranchise(10); checks.push(finite("Franquia Nacional investimento",fn.investment.total),finite("Franquia Nacional média mensal",fn.avgMonthly));
   const fi=calculateInternationalInvestment(); const fd=calculateInternationalDre(10); checks.push(finite("Franquia Internacional investimento",fi.total),finite("Franquia Internacional líquido",fd.netBrl));
   const mm=calculateMiniMaster({bikes:300}); checks.push(finite("Mini-Master líquido",mm.net));
   const mr=calculateMasterRegional(); checks.push(finite("Master Regional mensal",mr.monthlyRevenue));
 }catch(e){
   checks.push({name:"Execução geral",ok:false,detail:e instanceof Error?e.message:"erro"});
 }

 const passed=checks.filter(x=>x.ok).length;
 return Response.json({
   ok:passed===checks.length,
   passed,
   total:checks.length,
   checks,
   infrastructure:{
     aiConfigured:Boolean(process.env.OPENAI_API_KEY),
     supabaseConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
     appUrlConfigured:Boolean(process.env.NEXT_PUBLIC_APP_URL)
   },
   generatedAt:new Date().toISOString()
 },{headers:{"Cache-Control":"no-store"}});
}
