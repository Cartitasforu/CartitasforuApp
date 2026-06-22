import { supabase } from "@/lib/supabase";

export default async function resetPassword(
  password: string
) {
  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    throw error;
  }
}