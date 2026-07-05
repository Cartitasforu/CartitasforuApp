import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import "../global.css";
import { router, Stack, useRootNavigationState, useSegments } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const isNavigationReady = Boolean(rootNavigationState?.key);

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

  const isRedirectPending = useMemo(() => {
    if (!isNavigationReady || loading || !pendingEmailLoaded) {
      return false;
    }

    if (needsSpaceResolution && (!spaceInitialized || spaceLoading)) {
      return false;
    }

    if (
      needsSpaceResolution &&
      space &&
      (hasTwoMembersLoading || hasTwoMembers === null)
    ) {
      return false;
    }

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === "(auth)";
    const inOnboardingGroup = firstSegment === "(onboarding)";
    const inAppGroup = firstSegment === "(app)";
    const isVerifyOtpScreen = inAuthGroup && segments[1] === "verify-email";
    const inSpacesGroup = firstSegment === "(app)" && segments[1] === "spaces";

    if (!session && pendingEmail && !isVerifyOtpScreen) {
      return true;
    }

    if (!session && !inAuthGroup) {
      return true;
    }

    if (session && profile && !profile.email_verified_at && !isVerifyOtpScreen) {
      return true;
    }

    if (
      session &&
      profile?.email_verified_at &&
      !profile?.onboarding_completed &&
      !inOnboardingGroup
    ) {
      return true;
    }

    if (!spaceLoading && !hasTwoMembersLoading && hasTwoMembers && (!inAppGroup || inSpacesGroup)) {
      return true;
    }

    if (session && profile?.email_verified_at && profile.onboarding_completed) {
      if (!spaceLoading && space === null && !inSpacesGroup) {
        return true;
      }

      if (!spaceLoading && space && hasTwoMembers === false && !inSpacesGroup) {
        return true;
      }
    }

    return false;
  }, [
    isNavigationReady,
    loading,
    pendingEmailLoaded,
    needsSpaceResolution,
    spaceInitialized,
    spaceLoading,
    space,
    hasTwoMembersLoading,
    hasTwoMembers,
    session,
    profile,
    segments,
    pendingEmail,
  ]);

  useEffect(() => {
    if (!isNavigationReady || loading || !pendingEmailLoaded) return;

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
      return;
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
    isNavigationReady,
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

  const showLoadingOverlay =
    loading ||
    !pendingEmailLoaded ||
    isResolvingSpace ||
    isResolvingMembers ||
    isRedirectPending;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {showLoadingOverlay ? (
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center bg-bgPink"
        >
          <ActivityIndicator />
        </View>
      ) : null}
    </>
  );
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
