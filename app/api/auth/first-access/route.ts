import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ACTIVATION_PASSWORD, isCorporateEmail, normalizeCorporateEmail } from "@/lib/corporate-auth";

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

    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("id,email,active")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ ok: false, reason: "profile_lookup_failed" }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ ok: false, reason: "profile_missing" }, { status: 403 });
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
      if (alreadyExists) return NextResponse.json({ ok: true, created: false });
      return NextResponse.json({ ok: false, reason: "auth_create_failed", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: Boolean(data.user) });
  } catch (error) {
    return NextResponse.json({ ok: false, reason: "first_access_error", message: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}
