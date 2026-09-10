"use client";
import type { JourneyStep } from "@/lib/types";
const steps:[JourneyStep,string][]=[
 ["client","Cliente"],["solution","Solução"],["simulation","Simulação"],["confirmation","Confirmação"],["comparison","Comparador"],["proposal","Proposta"]
];
export default function JourneyStepper({step,onChange}:{step:JourneyStep,onChange:(s:JourneyStep)=>void}) {
 return <div className="stepper" style={{gridTemplateColumns:"repeat(6,minmax(78px,1fr))"}}>{steps.map(([id,label],i)=>
  <button key={id} className={step===id?"active":""} onClick={()=>onChange(id)}>
    <b>{String(i+1).padStart(2,"0")}</b><span>{label}</span>
  </button>)}</div>
}
