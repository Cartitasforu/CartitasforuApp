import { supabase } from "./supabase"


export default async function userAlreadyExists(email:string) {

    const normalizedEmail = email.trim().toLowerCase()

    const { data } = await supabase
      .from("user")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    
    return data?.email === normalizedEmail
}
