import { supabase } from "@/lib/supabase";

export default async function otpVerify(email: string, token: string){
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if(error){
        throw new Error(error.message)
    }

    return data
    
}