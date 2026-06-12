import { supabase } from "@/lib/supabase";
import { SignInFormData } from "../schemas/sign-in.schema";

export async function signInWithEmailAndPassword(data: SignInFormData) {
    const {email, password} = data

    const {data: body, error} = await supabase.auth.signInWithPassword({email, password})

    if(error){
        console.log(error.message)
        if (error.status === 404) {
          throw new Error("El usuario ingresado no se encuuentra registrado.");
        }
        throw new Error(error.message)
    }

    return body
};
