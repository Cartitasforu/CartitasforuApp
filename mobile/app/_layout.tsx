import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import "../global.css";
import { router, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function RootNavigationGate() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingEmailLoaded, setPendingEmailLoaded] = useState(false);

  const { session, profile, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    async function loadPendingEmail() {
      const storedEmail = await AsyncStorage.getItem(
        "pending_verification_email"
      );
      setPendingEmail(storedEmail);
      setPendingEmailLoaded(true);
    }

    loadPendingEmail();
  }, []);

  const firstSegment = segments[0];
  const secondSegment = segments[1];

  const inAuthGroup = firstSegment === "(auth)";
  const inOnboardingGroup = firstSegment === "(onboarding)";
  const inAppGroup = firstSegment === "(app)";

  const isVerifyOtpScreen =
    inAuthGroup && secondSegment === "verify-email";

  // 🔥 RESET PASSWORD DETECTION (CLAVE)
  const isResetPasswordScreen =
    inAuthGroup && secondSegment === "reset-password";

  useEffect(() => {
    if (loading || !pendingEmailLoaded) return;

    // 🔥 1. PERMITIR RESET PASSWORD SIN INTERFERENCIA
    if (isResetPasswordScreen) return;

    // 🔥 2. SIN SESSION + EMAIL PENDIENTE
    if (!session && pendingEmail) {
      if (!isVerifyOtpScreen) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: pendingEmail },
        });
      }
      return;
    }

    // 🔥 3. SIN SESSION → SIGNIN
    if (!session) {
      if (!inAuthGroup) {
        router.replace("/(auth)/signin");
      }
      return;
    }

    // 🔥 4. EMAIL NO VERIFICADO
    if (session && profile && !profile.email_verified_at) {
      if (!isVerifyOtpScreen) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: session.user.email ?? "" },
        });
      }
      return;
    }

    // 🔥 5. ONBOARDING
    if (
      session &&
      profile?.email_verified_at &&
      !profile?.onboarding_completed
    ) {
      if (!inOnboardingGroup) {
        router.replace({
          pathname: "/(onboarding)",
          params: { userId: session.user.id ?? "" },
        });
      }
      return;
    }

    // 🔥 6. APP PRINCIPAL
    if (
      session &&
      profile?.email_verified_at &&
      profile.onboarding_completed
    ) {
      if (!inAppGroup) {
        router.replace("/(app)/home");
      }
    }
  }, [
    loading,
    session,
    profile,
    segments,
    pendingEmail,
    pendingEmailLoaded,
  ]);

  if (loading || !pendingEmailLoaded) {
    return (
      <View className="flex justify-center align-middle">
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigationGate />
    </AuthProvider>
  );
}