import { supabase } from "@/lib/supabase";

export default async function otpVerify(email: string, otp: string){
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp, 
      type: "email",
    });

    if(error){
        throw error
    }

    return data
    
}