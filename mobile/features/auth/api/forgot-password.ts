import { supabase } from "@/lib/supabase";

export default async function forgotPassword(
  email: string
) {
  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "mobile://reset-password",
      }
    );

  if (error) {
    throw error;
  }
}