import { createServerFn } from "@tanstack/react-start";

// ── Delete user (requires service role) ──
export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) return { error: error.message };
    return { error: null };
  });

// ── Create user (requires service role) ──
export const createUser = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { email: string; password: string; nome: string; role: "admin" | "atendente" }) => data
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nome: data.nome },
    });

    if (authError) return { error: authError.message };

    if (data.role === "admin" && authData.user) {
      await supabaseAdmin
        .from("user_roles")
        .update({ role: "admin" })
        .eq("user_id", authData.user.id);
    }

    return { error: null };
  });
