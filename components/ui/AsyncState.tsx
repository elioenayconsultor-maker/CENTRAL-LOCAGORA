"use client";
import { AlertTriangle, Inbox, LoaderCircle, LockKeyhole } from "lucide-react";
type Props={state:"loading"|"empty"|"error"|"forbidden";title:string;description?:string;actionLabel?:string;onAction?:()=>void};
export default function AsyncState({state,title,description,actionLabel,onAction}:Props){const Icon=state==="loading"?LoaderCircle:state==="empty"?Inbox:state==="forbidden"?LockKeyhole:AlertTriangle;return <section className="asyncState" role={state==="error"?"alert":"status"} aria-live="polite"><Icon className={state==="loading"?"spin":""} aria-hidden="true"/><h2>{title}</h2>{description&&<p>{description}</p>}{actionLabel&&onAction&&<button className="secondary" onClick={onAction}>{actionLabel}</button>}</section>}
