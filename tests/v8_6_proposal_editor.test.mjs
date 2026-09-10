import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');

test('v8.6 usa editor fixo e permite selecionar as dez paginas',()=>{
  const w=read('components/ProposalWorkspace.tsx');
  assert.match(w,/proposalEditorDock/);
  assert.match(w,/pageNames=\["Capa"/);
  assert.match(w,/"Contracapa"/);
  assert.match(w,/selectedPage/);
  assert.match(w,/Horizontal/);
  assert.match(w,/Vertical/);
  assert.match(w,/Tela cheia/);
});

test('v8.6 exporta captura full hd para pdf 16 por 9',()=>{
  const p=read('lib/client-pdf.ts');
  assert.match(p,/captureW=1920,captureH=1080/);
  assert.match(p,/pdfW=960,pdfH=540/);
  assert.match(p,/canvas\.width!==captureW/);
});

test('v8.6 aplica cabecalho corporativo escuro e reduz caixas na proposta',()=>{
  const css=read('app/globals.css');
  assert.match(css,/V8\.6 — DARK CORPORATE/);
  assert.match(css,/\.appHeader\{background:rgba\(5,24,57/);
  assert.match(css,/\.proposalEditorDock\{position:fixed/);
  assert.match(css,/\.proposalCoverClientCard\{display:none!important\}/);
});
