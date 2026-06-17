import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: candidates, error: fetchError } = await supabase
      .from("user")
      .select("id, email, created_at, email_verified_at")
      .is("email_verified_at", null)
      .lt("created_at", cutoff);

    if (fetchError) {
      throw fetchError;
    }

    const results: Array<Record<string, unknown>> = [];

    const { data: authUsersData, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const authUsers = authUsersData.users ?? [];

    for (const candidate of candidates ?? []) {
      const authUser = authUsers.find((u) => u.id === candidate.id);

      if (!authUser) {
        results.push({
          userId: candidate.id,
          email: candidate.email,
          status: "skipped",
          reason: "No existe en auth.users",
        });
        continue;
      }

      const provider =
        authUser.app_metadata?.provider ??
        authUser.identities?.[0]?.provider ??
        null;

      const emailConfirmedAt = authUser.email_confirmed_at ?? null;

      if (provider !== "email") {
        results.push({
          userId: candidate.id,
          email: candidate.email,
          status: "skipped",
          reason: `Provider excluido: ${provider}`,
        });
        continue;
      }

      if (emailConfirmedAt) {
        results.push({
          userId: candidate.id,
          email: candidate.email,
          status: "skipped",
          reason: "Usuario ya confirmado en auth.users",
        });
        continue;
      }

      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        candidate.id
      );

      if (deleteError) {
        results.push({
          userId: candidate.id,
          email: candidate.email,
          status: "error",
          reason: deleteError.message,
        });
        continue;
      }

      results.push({
        userId: candidate.id,
        email: candidate.email,
        status: "deleted",
        reason: "No verificado después de 1 hora",
      });
    }

    return new Response(
      JSON.stringify(
        {
          ok: true,
          processed: results.length,
          results,
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});