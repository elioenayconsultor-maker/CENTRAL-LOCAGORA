export const analyticsEvents = [
  "public_simulator_viewed",
  "public_premises_loaded",
  "public_premises_unavailable",
  "public_simulation_calculated",
  "public_simulation_failed",
  "public_lead_submit_started",
  "public_lead_validation_failed",
  "public_lead_captured",
  "public_lead_capture_failed",
  "commercial_notification_sent",
  "commercial_notification_failed",
  "commercial_notification_not_configured",
  "crm_pipeline_viewed",
  "crm_lead_status_changed"
] as const;

export type AnalyticsEventName=(typeof analyticsEvents)[number];

type AnalyticsPayload={
  event:AnalyticsEventName;
  route?:string;
  productRoute?:string;
  premiseVersion?:number;
  metadata?:Record<string,string|number|boolean|null>;
};

const SESSION_KEY="locagora_analytics_session";
function sessionId(){
  if(typeof window==="undefined")return "server";
  let value=sessionStorage.getItem(SESSION_KEY);
  if(!value){value=crypto.randomUUID();sessionStorage.setItem(SESSION_KEY,value);}
  return value;
}

export function trackAnalytics(payload:AnalyticsPayload){
  if(typeof window==="undefined")return;
  const body=JSON.stringify({...payload,sessionId:sessionId()});
  void fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body,keepalive:true}).catch(()=>undefined);
}
