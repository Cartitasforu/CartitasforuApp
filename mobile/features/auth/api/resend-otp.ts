import { supabase } from "@/lib/supabase";

export async function resendOtpCode(email: string) {
    const {error} = await supabase.auth.resend({
        type: "signup",
        email
    })

    if(error){
        throw new Error(error.message)
    }
}