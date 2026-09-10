"use client";
import styles from "./ProposalConsultantIdentity.module.css";

export default function ProposalConsultantIdentity({name,phone,email,photo,initials}:{name:string;phone:string;email?:string;photo?:string;initials:string}){
 return <div className={styles.card}>
  {photo?<div className={styles.photoStage}><img className={styles.photo} src={photo} alt="Consultor Locagora"/></div>:<span className={styles.avatarFallback}>{initials}</span>}
  <div className={styles.info}><small>SEU CONSULTOR LOCAGORA</small><b>{name||"Equipe Locagora"}</b><span>{phone||"Contato a confirmar"}</span>{email&&<><span className={styles.label}>E-mail</span><span>{email}</span></>}</div>
 </div>;
}
