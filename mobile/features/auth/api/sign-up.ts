import { supabase } from "@/lib/supabase";
import { SignUpFormData } from "../schemas/sign-up.schema";

export async function signUp(data: SignUpFormData){
    const { email, password } = data;

    const {data: body, error} = await supabase.auth.signUp({
        email,
        password
    })

    if(error){
        console.error("Supabase signUp error:", error.message, error.status);

        // Mensajes específicos en lugar de uno genérico
        if (error.message.includes("already registered")) {
          throw new Error("Este correo ya tiene una cuenta registrada.");
        }
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