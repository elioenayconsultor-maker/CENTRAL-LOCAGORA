import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('first access is gated by consultant profile',()=>{
 const s=read('components/AuthGate.tsx');
 assert.match(s,/ConsultantProfileGate/);
 assert.match(s,/access\?\.status === "active"/);
});

test('consultant profile stores name phone email linkage and optional avatar',()=>{
 const s=read('supabase/migrations/20260910_v9_2_5_consultant_profile.sql');
 assert.match(s,/add column if not exists phone text/);
 assert.match(s,/add column if not exists avatar_path text/);
 assert.match(s,/profile_completed_at/);
 assert.match(s,/complete_my_commercial_profile/);
 assert.match(s,/auth\.uid\(\)/);
});

test('avatar bucket is private and scoped to authenticated user folder',()=>{
 const s=read('supabase/migrations/20260910_v9_2_5_consultant_profile.sql');
 assert.match(s,/commercial-user-avatars/);
 assert.match(s,/false,/);
 assert.match(s,/storage\.foldername\(name\)/);
});

test('proposal identity is sourced from logged consultant profile',()=>{
 const s=read('components/ProposalWorkspace.tsx');
 assert.match(s,/getMyConsultantProfile/);
 assert.match(s,/consultantEmail:profile\.email/);
 assert.match(s,/readOnly/);
});

test('proposal consultant card is visually emphasized and includes email',()=>{
 const s=read('components/ProposalConsultantIdentity.tsx');
 const css=read('components/ProposalConsultantIdentity.module.css');
 assert.match(s,/SEU CONSULTOR LOCAGORA/);
 assert.match(s,/email/);
 assert.match(css,/width:34%/);
 assert.match(css,/border:1px solid rgba\(125,235,66/);
 assert.match(css,/88px/);
});
