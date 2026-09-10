import { NextRequest, NextResponse } from "next/server";
import { checkTerritory } from "@/lib/territory";

export async function GET(request:NextRequest){
  const q=request.nextUrl.searchParams;
  const product=q.get("product")==="master"?"master":"mini";
  const city=q.get("city")||"";
  const state=q.get("state")||"";
  const population=Number(q.get("population")||0);
  return NextResponse.json(checkTerritory({product,city,state,population}),{
    headers:{"Cache-Control":"no-store"}
  });
}
