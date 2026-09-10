import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");

test("v8.7.1 uses public landing at root and keeps corporate workspace protected under /central",()=>{
  const root=read("app/page.tsx");
  const central=read("app/central/page.tsx");
  const acesso=read("app/acesso/page.tsx");
  assert.match(root,/CENTRAL PÚBLICA/);
  assert.match(root,/href="\/negocios"/);
  assert.match(root,/href="\/simulador"/);
  assert.match(root,/href="\/acesso"/);
  assert.match(central,/AuthGate/);
  assert.match(acesso,/href="\/central"/);
});
