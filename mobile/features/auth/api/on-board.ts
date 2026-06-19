import { supabase } from "@/lib/supabase";
import { OnBoardidngFormData } from "../schemas/on-boarding.schema";

export async function completeProfile(userId: string, data: OnBoardidngFormData, filePath: string) {
    const {full_name, birth_date, nickname, gender, interests} = data

    const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

    const {error} = await supabase
    .from("user")
    .update({full_name, birth_date, nickname, gender, interests, profile_photo_url: urlData, onboarding_completed: true})
    .eq("id", userId)

    if(error) {
        console.log(error.message)
        throw new Error(error.message)
    }


}
