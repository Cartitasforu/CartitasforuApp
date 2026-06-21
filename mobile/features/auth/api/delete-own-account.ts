import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function deleteOwnAccount() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem("pending_verification_email");
    return;
  }

  const { data, error } = await supabase.functions.invoke(
    "delete-own-account",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) {
    throw error;
  }

  await supabase.auth.signOut();
  await AsyncStorage.removeItem("pending_verification_email");
}