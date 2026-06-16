import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import "../global.css";
import { router, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function RootNavigationGate() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingEmailLoaded, setPendingEmailLoaded] = useState(false);
  const {session, profile, loading} = useAuth()
  const segments = useSegments()

  useEffect(() => {
    async function loadPendingEmail() {
      const storedEmail = await AsyncStorage.getItem(
        "pending_verification_email",
      );
      setPendingEmail(storedEmail);
      setPendingEmailLoaded(true);
    }

    loadPendingEmail();
  }, []);

  useEffect(() => {
    if(loading || !pendingEmailLoaded) return 

    const firstSegment = segments[0]

    const inAuthGroup = firstSegment === "(auth)"
    const inOnboardingGroup = firstSegment === "(onboarding)"
    const isVerifyOtpScreen = inAuthGroup && segments[1] === "verify-email";

    if (!session && pendingEmail) {
      if (!isVerifyOtpScreen) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: pendingEmail },
        });
      }
      return;
    }

    if(!session) {
      if(!inAuthGroup) {
        router.replace("/(auth)/signin")
      }
      return
    }

    if(session && profile && !profile.email_verified_at) {
      if(!isVerifyOtpScreen) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: {email: session.user.email ?? ""}
        })
      }
      return
    }

    if(session && profile?.email_verified_at) {
      if(!inOnboardingGroup){
        router.replace("/(onboarding)")
      }
    }
  
    
  }, [loading, session, profile, segments, pendingEmail, pendingEmailLoaded])

  if (loading || !pendingEmailLoaded) {
    return (
      <View className="flex justify-center align-middle">
        <ActivityIndicator/>
      </View>
    )
  }

  return <Stack screenOptions={{headerShown: false}}/>
  
}

export default function RootLayout() {
  return (
  <AuthProvider>
    <RootNavigationGate/>
  </AuthProvider>
  )
}
