import { NextRequest } from "next/server";
import { NETWORK_POINTS } from "@/lib/network";

export async function GET(req:NextRequest){
  const q=req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  const points=q?NETWORK_POINTS.filter(p=>[p.name,p.city,p.state,p.country,p.status].join(" ").toLowerCase().includes(q)):NETWORK_POINTS;
  return Response.json({updatedAt:new Date().toISOString(),points});
}
