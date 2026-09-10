import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
test('public product flow opens presentation before simulation',()=>{const detail=read('app/negocios/[slug]/page.tsx');const sim=read('components/PublicSimulator.tsx');assert.match(detail,/Simular este modelo/);assert.match(detail,/href="#simulacao"/);assert.match(detail,/PublicModelSimulator/);assert.match(sim,/\/negocios\/locinvest/)});
test('public presentations are standardized to ten fallback pages and fullscreen',()=>{const s=read('components/PublicProductGallery.tsx');assert.match(s,/Array\.from\(\{length:10\}/);assert.match(s,/requestFullscreen/);assert.match(s,/slidePageNav/)});
test('admin has presentation standby and deletion controls',()=>{const s=read('components/PublicPresentationAdmin.tsx');assert.match(s,/Colocar em standby/);assert.match(s,/Excluir apresentação/);assert.match(s,/Publicar \/ Reativar/)});
test('testimonials are admin managed and public',()=>{const a=read('components/TestimonialAdmin.tsx');const p=read('components/PublicTestimonials.tsx');assert.match(a,/youtube_url/);assert.match(a,/Colocar em standby/);assert.match(p,/youtube-nocookie\.com/)});
test('client email confirmation and resend exist',()=>{const lib=read('lib/lead-notification.ts');const crm=read('components/CommercialCRM.tsx');assert.match(lib,/sendCustomerConfirmationEmail/);assert.match(crm,/Reenviar ao cliente/);assert.match(read('components/Phase5Admin.tsx'),/Testar e-mail/)});
test('product catalog supports lifecycle',()=>{const s=read('components/ProductCatalogAdmin.tsx');assert.match(s,/Adicionar produto/);assert.match(s,/Standby/);assert.match(s,/Fora de comercialização/)});
test('v8.7 migration adds testimonials, product catalog and customer mail status',()=>{const s=read('supabase/migrations/20260913_v14_v8_7_testimonials_email.sql');assert.match(s,/commercial_public_testimonials/);assert.match(s,/commercial_public_product_catalog/);assert.match(s,/customer_notification_status/)});



