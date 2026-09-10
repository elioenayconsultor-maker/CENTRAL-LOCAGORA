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
        setError("O link de confirmação não criou uma sessão válida. Solicite um novo acesso pela tela inicial.");
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
    if (!passwordCheck.differsFromActivation) return setError("A senha pessoal não pode ser a senha padrão de ativação.");
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

    const access = await activateCorporateAccess();
    setProfileStatus(access.status);
    setDone(true);
    setLoading(false);
  };

  if (!ready) return <main className="authScreen"><section className="authCard"><p>Validando confirmação...</p></section></main>;

  if (done) {
    const allowed = profileStatus === "active";
    return <main className="authScreen"><section className="authCard">
      <div className={`authIcon ${allowed ? "" : "danger"}`}><CheckCircle2 /></div>
      <div className="activationHint"><ShieldCheck size={15}/><span>ETAPA 1 DE 2 CONCLUÍDA</span></div>
      <h1>Senha definitiva criada</h1>
      <p>{allowed ? "Agora complete seu perfil profissional para liberar a Central Comercial." : "Sua senha definitiva foi criada, mas o perfil corporativo ainda precisa estar cadastrado e ativo no CRM Locagora."}</p>
      <button className="primary" onClick={() => { window.location.href = "/central"; }}>{allowed ? "Continuar para meu perfil" : "Voltar ao acesso"}</button>
    </section></main>;
  }

  return <main className="authScreen"><section className="authCard">
    <div className="authIcon"><KeyRound /></div>
    <div className="activationHint"><ShieldCheck size={15}/><span>PRIMEIRO ACESSO • ETAPA 1 DE 2</span></div>
    <h1>Crie sua senha definitiva</h1>
    <p>Seu e-mail <b>{email}</b> foi confirmado. Antes de entrar na Central, substitua a senha de ativação por uma senha pessoal.</p>
    {profileStatus === "profile_missing" && <div className="statusWarn">Seu e-mail foi confirmado, mas ainda não há perfil correspondente no CRM. Você pode definir sua senha; a liberação dependerá do cadastro pelo gestor.</div>}
    <form onSubmit={submit}>
      <label>Nova senha<input type="password" required minLength={MIN_PERMANENT_PASSWORD_LENGTH} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label>
      <div className="activationHint"><ShieldCheck size={15}/><span>{MIN_PERMANENT_PASSWORD_LENGTH}+ caracteres, com letras e números. Maiúsculas e caractere especial aumentam a segurança.</span></div>
      {password && <div className={passwordCheck.valid ? "statusOk" : "statusWarn"}>Força da senha: <b>{permanentPasswordStrengthLabel(passwordCheck.score)}</b></div>}
      <label>Confirmar nova senha<input type="password" required minLength={MIN_PERMANENT_PASSWORD_LENGTH} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label>
      {confirm && !passwordsMatch && <div className="statusWarn">As senhas ainda não coincidem.</div>}
      {error && <div className="statusWarn">{error}</div>}
      <button className="primary" disabled={loading || !passwordCheck.valid || !passwordsMatch}><KeyRound size={17}/>{loading ? "Salvando..." : "Salvar senha e continuar"}</button>
    </form>
  </section></main>;
}
