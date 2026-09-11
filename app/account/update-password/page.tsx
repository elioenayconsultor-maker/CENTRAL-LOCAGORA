"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { activateCorporateAccess, DEFAULT_ACTIVATION_PASSWORD, isCorporateEmail } from "@/lib/corporate-auth";
import { checkPermanentPassword, MIN_PERMANENT_PASSWORD_LENGTH, permanentPasswordStrengthLabel } from "@/lib/first-access";

export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [profileStatus, setProfileStatus] = useState("");

  const passwordCheck = useMemo(() => checkPermanentPassword(password, DEFAULT_ACTIVATION_PASSWORD), [password]);
  const passwordsMatch = password.length > 0 && password === confirm;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setError("Sua sessão de primeiro acesso não está mais ativa. Volte à tela inicial e entre novamente com a senha padrão.");
        setReady(true);
        return;
      }
      const userEmail = data.user.email || "";
      setEmail(userEmail);
      if (!isCorporateEmail(userEmail)) {
        setError("Este acesso não pertence ao domínio corporativo autorizado.");
        await supabase.auth.signOut();
        setReady(true);
        return;
      }
      const access = await activateCorporateAccess();
      setProfileStatus(access.status);
      setReady(true);
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!passwordCheck.length) return setError(`Crie uma senha pessoal com pelo menos ${MIN_PERMANENT_PASSWORD_LENGTH} caracteres.`);
    if (!passwordCheck.hasLetter || !passwordCheck.hasNumber) return setError("A senha definitiva precisa combinar letras e números.");
    if (!passwordCheck.differsFromActivation) return setError("A senha pessoal não pode ser a senha padrão de primeiro acesso.");
    if (!passwordsMatch) return setError("As duas senhas não coincidem.");

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { activation_required: false, activated_at: new Date().toISOString(), first_access_password_completed: true },
    });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    const {data:sessionData}=await supabase.auth.getSession();
    const token=sessionData.session?.access_token||"";
    const finalize=await fetch("/api/auth/complete-password",{method:"POST",headers:{Authorization:`Bearer ${token}`}});
    const finalized=await finalize.json().catch(()=>null);
    if(!finalize.ok||!finalized?.ok){
      setError("A nova senha foi salva, mas não foi possível concluir a ativação do perfil. Tente entrar novamente ou solicite suporte ao administrador.");
      setLoading(false);
      return;
    }

    const access = await activateCorporateAccess();
    setProfileStatus(access.status);
    setDone(true);
    setLoading(false);
  };

  if (!ready) return <main className="authScreen"><section className="authCard"><p>Preparando primeiro acesso...</p></section></main>;

  if (done) {
    const allowed = profileStatus === "active";
    return <main className="authScreen"><section className="authCard">
      <div className={`authIcon ${allowed ? "" : "danger"}`}><CheckCircle2 /></div>
      <div className="activationHint"><ShieldCheck size={15}/><span>ACESSO ATIVADO</span></div>
      <h1>Senha definitiva criada</h1>
      <p>{allowed ? "Seu acesso está pronto. Agora complete ou revise seu perfil profissional para usar a Central Comercial." : "Sua senha foi criada, mas o acesso está bloqueado ou ainda depende de liberação do administrador."}</p>
      <button className="primary" onClick={() => { window.location.href = "/central"; }}>{allowed ? "Entrar na Central" : "Voltar ao acesso"}</button>
    </section></main>;
  }

  return <main className="authScreen"><section className="authCard">
    <div className="authIcon"><KeyRound /></div>
    <div className="activationHint"><ShieldCheck size={15}/><span>ATIVAÇÃO DE ACESSO</span></div>
    <h1>Crie sua senha definitiva</h1>
    <p>Você entrou com a senha padrão. Agora substitua-a por uma senha pessoal para concluir o acesso.</p>
    <p><b>{email}</b></p>
    {profileStatus === "profile_missing" && <div className="statusWarn">Seu perfil ainda não foi vinculado corretamente. Volte à tela de acesso e tente novamente com a senha padrão.</div>}
    {profileStatus === "inactive" && <div className="statusWarn">Este acesso está bloqueado pelo administrador.</div>}
    <form onSubmit={submit}>
      <label>Nova senha<input type="password" required minLength={MIN_PERMANENT_PASSWORD_LENGTH} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label>
      <div className="activationHint"><ShieldCheck size={15}/><span>{MIN_PERMANENT_PASSWORD_LENGTH}+ caracteres, com letras e números. Maiúsculas e caractere especial aumentam a segurança.</span></div>
      {password && <div className={passwordCheck.valid ? "statusOk" : "statusWarn"}>Força da senha: <b>{permanentPasswordStrengthLabel(passwordCheck.score)}</b></div>}
      <label>Confirmar nova senha<input type="password" required minLength={MIN_PERMANENT_PASSWORD_LENGTH} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label>
      {confirm && !passwordsMatch && <div className="statusWarn">As senhas ainda não coincidem.</div>}
      {error && <div className="statusWarn">{error}</div>}
      <button className="primary" disabled={loading || !passwordCheck.valid || !passwordsMatch}><KeyRound size={17}/>{loading ? "Salvando..." : "Salvar senha e entrar"}</button>
    </form>
  </section></main>;
}
