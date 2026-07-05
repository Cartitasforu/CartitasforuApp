import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import "../global.css";
import { router, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SpaceProvider, useSpace } from "@/providers/SpaceProvider";
import { spaceHasTwoMembers } from "@/features/spaces/api/spaceHasTwoMembers";

function RootNavigationGate() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingEmailLoaded, setPendingEmailLoaded] = useState(false);
  const [hasTwoMembers, setHasTwoMembers] = useState<boolean | null>(null);
  const [hasTwoMembersLoading, setHasTwoMembersLoading] = useState(false);
  const { session, profile, loading } = useAuth();
  const { space, loading: spaceLoading, syncVersion, initialized: spaceInitialized } = useSpace();


  const segments = useSegments();

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
    let mounted = true;

    async function loadSpaceMembers() {
      if (!session || !profile?.email_verified_at || !profile.onboarding_completed) {
        setHasTwoMembers(null);
        setHasTwoMembersLoading(false);
        return;
      }

      if (!space?.id) {
        setHasTwoMembers(null);
        setHasTwoMembersLoading(false);
        return;
      }

      setHasTwoMembersLoading(true);

      try {
        const result = await spaceHasTwoMembers(space.id);

        if (mounted) {
          setHasTwoMembers(result);
        }
      } catch {
        if (mounted) {
          setHasTwoMembers(false);
        }
      } finally {
        if (mounted) {
          setHasTwoMembersLoading(false);
        }
      }
    }

    loadSpaceMembers();

    return () => {
      mounted = false;
    };
  }, [session, profile?.email_verified_at, profile?.onboarding_completed, space?.id, syncVersion]);

  useEffect(() => {
    if (loading || !pendingEmailLoaded) return;

    const needsSpaceResolution =
      !!session &&
      !!profile?.email_verified_at &&
      !!profile?.onboarding_completed;

    if (needsSpaceResolution && (!spaceInitialized || spaceLoading)) {
      return;
    }

    if (
      needsSpaceResolution &&
      space &&
      (hasTwoMembersLoading || hasTwoMembers === null)
    ) {
      return;
    }


    const firstSegment = segments[0];

    const inAuthGroup = firstSegment === "(auth)";
    const inOnboardingGroup = firstSegment === "(onboarding)";
    const inAppGroup = firstSegment === "(app)";
    const isVerifyOtpScreen = inAuthGroup && segments[1] === "verify-email";
    const inSpacesGroup = firstSegment === "(app)" && segments[1] === "spaces";

    if (!session && pendingEmail) {
      if (!isVerifyOtpScreen) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: pendingEmail },
        });
      }
      return;
    }

    if (!session) {
      if (!inAuthGroup) {
        router.replace("/(auth)/signin");
      }
      return;
    }

    if (session && profile && !profile.email_verified_at) {
      if (!isVerifyOtpScreen) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: session.user.email ?? "" },
        });
      }
      return;
    }

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
    }
    if (!spaceLoading && !hasTwoMembersLoading && hasTwoMembers) {
      if (!inAppGroup || inSpacesGroup) {
        router.replace("/(app)/home");
      }
    }

    if (session && profile?.email_verified_at && profile.onboarding_completed) {
      if (!spaceLoading && space === null) {
        if (!inSpacesGroup) {
          router.replace("/(app)/spaces");
        }
        return;
      }

      if (!spaceLoading && space && hasTwoMembers === false) {
        if (!inSpacesGroup) {
          router.replace("/(app)/spaces");
        }
        return;
      }
    }

  }, [
    loading,
    spaceLoading,
    space,
    session,
    profile,
    segments,
    pendingEmail,
    pendingEmailLoaded,
    hasTwoMembers,
    hasTwoMembersLoading,
    spaceInitialized,
  ]);

  const needsSpaceResolution =
    !!session &&
    !!profile?.email_verified_at &&
    !!profile?.onboarding_completed;

  const isResolvingSpace =
    needsSpaceResolution && (!spaceInitialized || spaceLoading);

  const isResolvingMembers =
    needsSpaceResolution &&
    !!space?.id &&
    (hasTwoMembersLoading || hasTwoMembers === null);

  if (loading || !pendingEmailLoaded || isResolvingSpace || isResolvingMembers) {
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
      <SpaceProvider>
        <RootNavigationGate />
      </SpaceProvider>
    </AuthProvider>
  );
}
