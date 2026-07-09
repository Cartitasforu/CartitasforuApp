import { supabase } from "./supabase"


export default async function userAlreadyExists(email:string) {

    const normalizedEmail = email.trim().toLowerCase()

    const { error, data } = await supabase
      .from("user")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();

      if (error) throw error

    
    return data?.email === normalizedEmail
}
