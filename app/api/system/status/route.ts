import { getEmailProviderConfiguration } from "@/lib/lead-notification";

export const runtime="nodejs";
export async function GET(){
  const emailProvider=getEmailProviderConfiguration();
  return Response.json({
    aiConfigured:Boolean(process.env.OPENAI_API_KEY),
    proposalModelConfigured:Boolean(process.env.OPENAI_PROPOSAL_MODEL),
    supabaseConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    serviceRoleConfigured:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ...emailProvider,
    appUrlConfigured:Boolean(process.env.NEXT_PUBLIC_APP_URL),
    generatedAt:new Date().toISOString()
  },{headers:{"Cache-Control":"no-store"}});
}
