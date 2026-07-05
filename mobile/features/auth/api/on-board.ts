import { supabase } from "@/lib/supabase";
import { OnBoardidngFormData } from "../schemas/on-boarding.schema";

export async function completeProfile(
    userId: string,
    data: OnBoardidngFormData,
    filePath: string | null,
) {
        const {full_name, birth_date, nickname, gender, interests} = data

        const profileUpdates: Record<string, unknown> = {
            full_name,
            birth_date,
            nickname,
            gender,
            interests,
            onboarding_completed: true,
        };

        if (filePath) {
            const { data: urlData } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath);

            profileUpdates.profile_photo_url = urlData;
        }

    const {error} = await supabase
    .from("user")
        .update(profileUpdates)
    .eq("id", userId)

    if(error) {
        console.log(error.message)
        throw new Error(error.message)
    }


}
