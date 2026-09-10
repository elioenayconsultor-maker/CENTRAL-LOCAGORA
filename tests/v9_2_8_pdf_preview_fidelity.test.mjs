import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../lib/client-pdf.ts',import.meta.url),'utf8');

test('PDF captura a pagina renderizada, sem clone redimensionado para 1920',()=>{
  assert.doesNotMatch(src,/cloneNode\(true\)/);
  assert.doesNotMatch(src,/clone\.style.*1920/s);
});

test('resolucao Full HD e PDF 16:9 permanecem',()=>{
  assert.match(src,/captureW=1920/);
  assert.match(src,/captureH=1080/);
  assert.match(src,/pdfW=960/);
  assert.match(src,/pdfH=540/);
});

test('escala aumenta densidade sem recalcular geometria',()=>{
  assert.match(src,/scale=captureW\/rect\.width/);
  assert.match(src,/windowWidth:window\.innerWidth/);
});

test('ajustes visuais do editor permanecem na captura',()=>{
  assert.match(src,/html2canvas\(page/);
  assert.match(src,/onclone/);
});

test('saida e normalizada em 1920x1080',()=>{
  assert.match(src,/finalCanvas\.width=captureW/);
  assert.match(src,/finalCanvas\.height=captureH/);
  assert.match(src,/drawImage\(sourceCanvas,0,0,captureW,captureH\)/);
});
