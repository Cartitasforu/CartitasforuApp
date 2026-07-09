import { supabase } from "@/lib/supabase";

export async function spaceHasTwoMembers(spaceId: string | undefined) {
    if (!spaceId) {
        return false;
    }

    const { count, error } = await supabase
        .from("space_member")
        .select("*", { count: "exact", head: true })
        .eq("space_id", spaceId.trim());

    if (error) {
        throw new Error(error.message);
    }

    return count === 2;
}