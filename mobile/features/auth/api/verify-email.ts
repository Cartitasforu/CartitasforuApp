import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function otpVerify(email: string, token: string){


    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if(error){
        throw new Error(error.message)
    }

    const userId = data.user?.id

    if(!userId) {
        throw new Error("No se pudo obtener el usuario verificado")
    }

    const {error: profileError} = await supabase
    .from("user")
    .update({
        email_verified_at: new Date().toISOString()
    })
    .eq("id", userId)
    .is("email_verified_at", null)


    if(profileError){
        throw new Error(profileError.message)
    }

    await AsyncStorage.removeItem("pending_verification_email");
    
}