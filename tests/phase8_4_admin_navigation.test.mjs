import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
test("v8.4 remove crm analytics e admin da sidebar",()=>{const s=read("components/Sidebar.tsx");assert.ok(!s.includes("CRM • PIPELINE"));assert.ok(!s.includes("ANALYTICS • FUNIL"));assert.ok(!s.includes("ADMIN • CONFIGURAÇÕES"));});
test("engrenagem aparece somente para admin autorizado",()=>{const h=read("components/AppHeader.tsx");assert.match(h,/is_commercial_admin/);assert.match(h,/isAdmin&&<a href="\/admin"/);});
test("crm e analytics exigem gate administrativo",()=>{assert.match(read("app/crm/page.tsx"),/AdminOnlyGate/);assert.match(read("app/analytics/page.tsx"),/AdminOnlyGate/);});
