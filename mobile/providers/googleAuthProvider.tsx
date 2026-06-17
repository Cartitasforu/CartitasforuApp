import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = Linking.createURL("/");
    console.log("Redirect URI:", redirectTo); // debug temporal


  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error, cancelled: false };
  }

  const authUrl = data.url;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (result.type !== "success") {
    return { error: null, cancelled: true };
  }

  const url = result.url;

  // Supabase devuelve los tokens en el fragmento (#) no en query (?)
  const hashParams = new URLSearchParams(url.split("#")[1] ?? "");
  const access_token = hashParams.get("access_token");
  const refresh_token = hashParams.get("refresh_token");

  if (!access_token || !refresh_token) {
    return { error: new Error("No se recibieron tokens de la sesión"), cancelled: false };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  return { data: sessionData, error: sessionError, cancelled: false };
}