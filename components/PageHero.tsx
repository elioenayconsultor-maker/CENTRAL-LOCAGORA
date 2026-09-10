import type { ReactNode } from "react";

export default function PageHero({kicker,title,description,actions}:{kicker:string;title:string;description:string;actions?:ReactNode}){
 return <section className="centralPageHero">
   <div className="centralPageHeroCopy"><small>{kicker}</small><h1>{title}</h1><p>{description}</p></div>
   {actions&&<div className="centralPageHeroActions">{actions}</div>}
 </section>
}
