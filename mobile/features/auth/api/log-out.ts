import { supabase } from "@/lib/supabase";

export async function logOut(){
    const {error} = await supabase.auth.signOut({scope: "local"})

    if(error){
        console.log(error.message)
        throw new Error("Error al cerrar sesión")
    }
}