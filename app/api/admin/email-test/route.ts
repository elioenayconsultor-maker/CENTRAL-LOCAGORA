import { NextResponse } from "next/server";
import { requireCommercialRole } from "@/lib/server-access";
import { sendEmailTest } from "@/lib/lead-notification";

export async function POST(request:Request){
 const access=await requireCommercialRole(request,["admin"]);if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
 try{const body=await request.json() as {email?:string};const email=String(body.email||"").trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({ok:false,reason:"invalid_email"},{status:400});const result=await sendEmailTest(email);return NextResponse.json(result,{status:result.ok?200:502});}catch{return NextResponse.json({ok:false,reason:"invalid_request"},{status:400})}
}
