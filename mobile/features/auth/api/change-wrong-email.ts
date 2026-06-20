import { supabase } from "@/lib/supabase"
import AsyncStorage from "@react-native-async-storage/async-storage"

export async function changeWrongEmail() {
  await supabase.auth.signOut()
  await AsyncStorage.removeItem("pending_verification_email")
  //router.replace("/(auth)/signup")
}