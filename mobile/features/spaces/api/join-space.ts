import { supabase } from "@/lib/supabase";

export type JoinSpaceError =
  | "INVALID_CODE"
  | "SELF_JOIN"
  | "ALREADY_MEMBER"
  | "SPACE_FULL"
  | "UNKNOWN";

export async function joinSpaceByCode(code: string){
    const {data, error} = await supabase.rpc("join_space_by_code", {
        p_code: code.toUpperCase()
    })

    if(error){
        const msg = error.message as JoinSpaceError
        throw new Error(msg ?? "UNKNOWN")
    }

    return data as {
        space_id: string
        joined: boolean
    }
}