import { supabase } from "@/lib/supabase";

export async function createSpaceWithInvite(){
    const {data, error} = await supabase.rpc("create_space_with_invite")


    if(error){
        console.log("Error del rpc")
        throw error
    }

    return data as {
        space_id: string
        invitation_code: string
        already_exists: boolean
    }
}