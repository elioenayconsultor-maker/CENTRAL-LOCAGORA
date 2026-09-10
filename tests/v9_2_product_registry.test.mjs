import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
const registry=read("lib/product-registry.ts");
const products=read("lib/products.ts");
const publicProducts=read("lib/public-products.ts");
const simulator=read("components/PublicModelSimulator.tsx");
const conversion=read("components/PublicConversionForm.tsx");
const route=read("app/api/public-interest/route.ts");

const canonicalIds=[
  "locinvest","euroloc","locmillion","locinternacional","franquia_nacional",
  "exclusive_internacional","franquia_internacional_2x1","mini_master","master_regional"
];
const officialNames=[
  "LOCINVEST","LOCINVEST EUROPA","LOCMILLION","COTAS INTERNACIONAIS",
  "EXCLUSIVE BRASIL","EXCLUSIVE INTERNACIONAL","EXCLUSIVE 2X1","MINI-MASTER","MASTER"
];
const officialPublicSlugs=[
  "locinvest","euroloc","locmillion","cotas","exclusive",
  "franquia-internacional","franquia-2x1","mini-master","master"
];

test("V9.2.1 defines exactly the nine official commercial product identities",()=>{
  for(const id of canonicalIds) assert.ok(registry.includes(`id: "${id}"`),`missing ${id}`);
  assert.equal((registry.match(/\n    id: "/g)||[]).length,9);
});

test("official catalog names are normalized",()=>{
  for(const name of officialNames){
    assert.ok(registry.includes(`name: "${name}"`),`registry missing ${name}`);
    assert.ok(publicProducts.includes(`name:"${name}"`),`public catalog missing ${name}`);
  }
});

test("public catalog contains the nine official commercial slugs only",()=>{
  for(const slug of officialPublicSlugs) assert.ok(publicProducts.includes(`slug:"${slug}"`),`missing ${slug}`);
  assert.equal((publicProducts.match(/\n    slug:"/g)||[]).length,9);
  assert.ok(!publicProducts.includes('slug:"franquias"'));
  assert.ok(!publicProducts.includes('slug:"internacional"'));
});

test("catalog uses exactly the two official commercial groups",()=>{
  assert.ok(registry.includes('"INVESTIMENTOS BRASIL E INTERNACIONAL"'));
  assert.ok(registry.includes('"FRANQUIAS BRASIL E INTERNACIONAL"'));
  assert.ok(publicProducts.includes('category:"Investimentos Brasil e Internacional"'));
  assert.ok(publicProducts.includes('category:"Franquias Brasil e Internacional"'));
});

test("legacy corporate simulator excludes assisted products without fake minimums",()=>{
  assert.ok(products.includes("product.min !== null"));
  assert.ok(products.includes("product.calculatorKey !== null"));
  assert.ok(registry.includes('id: "exclusive_internacional"'));
  assert.ok(registry.includes("min: null"));
});

test("public simulator resolves calculators through registry",()=>{
  assert.ok(simulator.includes("getCalculatorKeyForPublicSlug"));
  assert.ok(simulator.includes('calculatorKey==="franquia-internacional"'));
});

test("public CRM handoff keeps canonical identity and WhatsApp",()=>{
  assert.ok(conversion.includes("canonicalProductMetadata"));
  assert.ok(conversion.includes("canonicalId:productIdentity?.id"));
  assert.ok(conversion.includes("5531983964474"));
  assert.ok(route.includes("product_identity:identity"));
  assert.ok(route.includes('crm:"local"'));
});
