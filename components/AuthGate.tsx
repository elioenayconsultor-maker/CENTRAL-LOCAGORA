"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { KeyRound, LogIn, MailCheck, ShieldCheck, UserX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConsultantProfileGate from "@/components/ConsultantProfileGate";
import {
  activateCorporateAccess,
  DEFAULT_ACTIVATION_PASSWORD,
  isCorporateEmail,
  normalizeCorporateEmail,
  type CorporateAccessResult,
} from "@/lib/corporate-auth";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [access, setAccess] = useState<CorporateAccessResult | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const checkSession = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const hasUser = Boolean(data.user);
    setAuthenticated(hasUser);
    if (!hasUser) {
      setAccess(null);
      setReady(true);
      return;
    }
    if (data.user?.user_metadata?.activation_required === true) {
      window.location.replace("/account/update-password");
      return;
    }
    const result = await activateCorporateAccess();
    setAccess(result);
    setReady(true);
  };

  useEffect(() => {
    const supabase = createClient();
    void checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void checkSession(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const corporateEmail = normalizeCorporateEmail(email);

    try {
      if (!isCorporateEmail(corporateEmail)) {
        setError("A Central aceita somente e-mails @locgrupo.com.br.");
        return;
      }

      const supabase = createClient();

      if (password === DEFAULT_ACTIVATION_PASSWORD) {
        const response = await fetch("/api/auth/first-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: corporateEmail }),
        });
        const provision = await response.json().catch(() => null);
        if (!response.ok || !provision?.ok) {
          if (provision?.reason === "profile_missing") setError("Este e-mail ainda não está cadastrado no sistema. Solicite o cadastro ao administrador.");
          else if (provision?.reason === "inactive") setError("Este acesso está bloqueado pelo administrador.");
          else setError("Não foi possível liberar o primeiro acesso agora.");
          return;
        }

        const { error: firstLoginError } = await supabase.auth.signInWithPassword({ email: corporateEmail, password });
        if (firstLoginError) {
          setError("A senha padrão só funciona no primeiro acesso. Se você já criou sua senha pessoal, use-a abaixo ou clique em Esqueci minha senha.");
          return;
        }
        window.location.replace("/account/update-password");
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: corporateEmail,
        password,
      });
      if (loginError) {
        setError("E-mail ou senha não conferem. No primeiro acesso, use a senha padrão fornecida pela empresa.");
        return;
      }

      const result = await activateCorporateAccess();
      setAccess(result);
      if (result.status !== "active") {
        await supabase.auth.signOut();
        if (result.status === "profile_missing") setError("Seu e-mail ainda não está cadastrado no sistema. Solicite o cadastro ao administrador.");
        else if (result.status === "inactive") setError("Seu acesso foi bloqueado pelo administrador.");
        else if (result.status === "already_linked") setError("Este perfil já está vinculado a outra credencial. Solicite revisão ao administrador.");
        else setError("Não foi possível validar seu acesso corporativo.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível realizar o acesso.");
    } finally {
      setLoading(false);
    }
  };

  const recoverPassword = async () => {
    setError("");
    setNotice("");
    const corporateEmail = normalizeCorporateEmail(email);
    if (!isCorporateEmail(corporateEmail)) {
      setError("Informe seu e-mail corporativo @locgrupo.com.br para recuperar a senha.");
      return;
    }

    setRecovering(true);
    try {
      const supabase = createClient();
      const appOrigin = window.location.origin.replace(/\/$/, "");
      const redirectTo = `${appOrigin}/auth/confirm?next=/account/update-password`;
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(corporateEmail, { redirectTo });
      if (recoveryError) throw recoveryError;
      setNotice(`Enviamos um link de recuperação para ${corporateEmail}. Abra o e-mail e crie uma nova senha.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setRecovering(false);
    }
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    setAuthenticated(false);
    setAccess(null);
  };

  if (!ready) return <div className="authLoading">Carregando Central Locagora...</div>;

  if (authenticated && access?.status === "active") return <ConsultantProfileGate>{children}</ConsultantProfileGate>;

  if (authenticated && access && access.status !== "active") {
    const text = access.status === "profile_missing"
      ? "Seu e-mail ainda não possui um perfil correspondente no sistema."
      : access.status === "inactive"
        ? "Seu acesso foi bloqueado pelo administrador."
        : access.status === "already_linked"
          ? "Este perfil já está vinculado a outra credencial de autenticação."
          : "Não foi possível autorizar este acesso corporativo.";
    return <main className="authScreen"><section className="authCard"><div className="authIcon danger"><UserX /></div><h1>Acesso indisponível</h1><p>{text}</p><button className="secondary" onClick={signOut}>Sair e usar outro e-mail</button></section></main>;
  }

  return <main className="authScreen">
    <section className="authCard">
      <div className="authBrand"><div className="brandLogoRow"><Image src="/locagora-logo.png" alt="Locagora - Assinatura de Motos" width={220} height={76} priority className="authLogo" /><span className="versionBadge">V9.0</span></div><small>CENTRAL COMERCIAL</small><div className="publicEntryLinks"><a href="/historia">História pública</a><a href="/negocios">Negócios & Investimentos</a></div></div>
      <div className="authIcon"><ShieldCheck /></div>
      <h1>Acesso corporativo</h1>
      <p>Use seu e-mail <b>@locgrupo.com.br</b>. No primeiro acesso, entre com a senha padrão fornecida pela empresa e crie sua senha pessoal imediatamente.</p>
      <form onSubmit={login}>
        <label>E-mail corporativo<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="nome@locgrupo.com.br" /></label>
        <label>Senha<input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <div className="activationHint"><KeyRound size={15}/><span>Primeiro acesso: use a senha padrão. Não há confirmação por e-mail; após entrar, você será direcionado para criar sua senha definitiva.</span></div>
        {notice && <div className="statusOk activationNotice"><MailCheck size={16}/><span>{notice}</span></div>}
        {error && <div className="statusWarn">{error}</div>}
        <button className="primary" disabled={loading || recovering}><LogIn size={17}/>{loading ? "Processando..." : "Entrar"}</button>
        <button type="button" className="secondary" disabled={loading || recovering} onClick={() => void recoverPassword()}>
          <KeyRound size={17}/>{recovering ? "Enviando recuperação..." : "Esqueci minha senha"}
        </button>
      </form>
    </section>
  </main>;
}
