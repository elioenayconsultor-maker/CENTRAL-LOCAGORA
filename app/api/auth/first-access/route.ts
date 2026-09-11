import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ACTIVATION_PASSWORD, isCorporateEmail, normalizeCorporateEmail } from "@/lib/corporate-auth";

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Colaborador";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") || "Colaborador";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeCorporateEmail(String(body?.email || ""));

    if (!isCorporateEmail(email)) {
      return NextResponse.json({ ok: false, reason: "invalid_domain" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, reason: "server_not_configured" }, { status: 503 });
    }

    let { data: profile, error: profileError } = await admin
      .from("users")
      .select("id,email,active")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ ok: false, reason: "profile_lookup_failed" }, { status: 500 });
    }

    // E-mails corporativos válidos podem fazer o próprio pré-cadastro no primeiro acesso.
    // O papel inicial é sempre CLOSER. O ADM continua podendo alterar função/equipe e bloquear o acesso.
    let selfPreregistered = false;
    if (!profile) {
      const { data: createdProfile, error: createProfileError } = await admin
        .from("users")
        .insert({
          name: nameFromEmail(email),
          email,
          role: "CLOSER",
          active: true,
          must_change_password: true,
          team_name: null,
        })
        .select("id,email,active")
        .single();

      if (createProfileError) {
        // Protege contra duas tentativas simultâneas com o mesmo e-mail.
        const { data: concurrentProfile, error: retryError } = await admin
          .from("users")
          .select("id,email,active")
          .eq("email", email)
          .maybeSingle();
        if (retryError || !concurrentProfile) {
          return NextResponse.json({ ok: false, reason: "profile_create_failed", message: createProfileError.message }, { status: 500 });
        }
        profile = concurrentProfile;
      } else {
        profile = createdProfile;
        selfPreregistered = true;
        await admin.from("commercial_audit_log").insert({
          action: "access_self_preregistered",
          entity_type: "user",
          entity_id: createdProfile.id,
          actor_email: email,
          metadata: { target_email: email, role: "closer", origin: "first_access" },
        });
      }
    }

    if (profile.active !== true) {
      return NextResponse.json({ ok: false, reason: "inactive" }, { status: 403 });
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: DEFAULT_ACTIVATION_PASSWORD,
      email_confirm: true,
      user_metadata: {
        activation_required: true,
        activation_origin: "central_locagora_direct",
      },
    });

    if (error) {
      const text = error.message.toLowerCase();
      const alreadyExists = text.includes("already") || text.includes("registered") || text.includes("exists");
      if (alreadyExists) return NextResponse.json({ ok: true, created: false, selfPreregistered });
      return NextResponse.json({ ok: false, reason: "auth_create_failed", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: Boolean(data.user), selfPreregistered });
  } catch (error) {
    return NextResponse.json({ ok: false, reason: "first_access_error", message: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}
