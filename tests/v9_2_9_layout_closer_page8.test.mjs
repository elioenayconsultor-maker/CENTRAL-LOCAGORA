import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const deck=fs.readFileSync('components/ProposalDeck.tsx','utf8');
const css=fs.readFileSync('components/ProposalDeckV929.module.css','utf8');

test('closer is rendered on page 8 and not page 7',()=>{
  const p7=deck.indexOf('<Page image="page-7.png"');
  const p8=deck.indexOf('<Page image="page-8.png"');
  const back=deck.indexOf('<Page image="back-cover.png"');
  const identity=deck.indexOf('<ProposalConsultantIdentity',p7);
  assert.ok(identity>p8 && identity<back);
});

test('page 8 has explicit closer class',()=>{
  assert.match(deck,/page-8\.png" n=\{8\} className="proposalFinalPage proposalCloserPage"/);
});

test('cover uses page-relative container units for stable app layout',()=>{
  assert.match(css,/container-type:\s*inline-size/);
  assert.match(css,/5\.35cqw/);
  assert.match(css,/proposalCoverFacts/);
});

test('closer photo is borderless in presentation',()=>{
  assert.match(css,/proposalCloserPage \.proposalConsultantIdentity img/);
  assert.match(css,/border:\s*0 !important/);
  assert.match(css,/border-radius:\s*0 !important/);
});

test('pdf generator is intentionally not replaced by this patch',()=>{
  assert.equal(fs.existsSync('lib/client-pdf.ts'),false);
});
