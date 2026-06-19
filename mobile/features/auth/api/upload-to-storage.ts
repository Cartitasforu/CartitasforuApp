import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

export async function uploadToStorage(image: any) {
  const imageToBase64 = image.base64;
  const fileExt = image.uri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}.${fileExt}`;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  const filePath = `users/${user.id}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("profile-images")
    .upload(filePath, decode(imageToBase64), {
      upsert: true,
      contentType: image.mimeType || "image/jpeg",
    });

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
  return data.fullPath;
}
