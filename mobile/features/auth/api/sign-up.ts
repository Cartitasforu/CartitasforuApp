import { supabase } from "@/lib/supabase";
import { SignUpFormData } from "../schemas/sign-up.schema";
import userAlreadyExists from "@/lib/userAlreadyExists";

export async function signUp(data: SignUpFormData){
    const { email, password } = data;

    const {data: body, error} = await supabase.auth.signUp({
        email,
        password
    })
    const userExists = await userAlreadyExists(email);

    console.log(userExists)

    if(userExists){
        throw new Error("Ya hay un usuario registrado con este email.")
    }
    
    if(error){
        console.error("Supabase signUp error:", error.message, error.status);

        
        if (error.message.includes("Password")) {
          throw new Error("La contraseña no cumple los requisitos mínimos.");
        }
        if (error.message.includes("rate limit") || error.status === 429) {
          throw new Error("Demasiados intentos. Espera un momento.");
        }

        throw new Error(error.message);
    }

    return body

}