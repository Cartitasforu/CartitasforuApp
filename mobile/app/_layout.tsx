import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import "../global.css";
import { router, Stack, useRootNavigationState, useSegments } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SpaceProvider, useSpace, Space } from "@/providers/SpaceProvider";
import { spaceHasTwoMembers } from "@/features/spaces/api/spaceHasTwoMembers";
import { Session } from "@supabase/supabase-js";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type UserProfile = {
  id: string;
  email_verified_at: string | null;
  onboarding_completed: boolean | null;
};

function getTargetRoute(params: {
  session: Session | null;
  profile: UserProfile | null;
  space: Space | null;
  hasTwoMembers: boolean | null;
  pendingEmail: string | null;
  currentSegments: string[];
}): { route: string; params?: Record<string, string> } | null {
  const { session, profile, space, hasTwoMembers, pendingEmail, currentSegments } = params;

  const firstSegment = currentSegments[0];
  const inAuthGroup = firstSegment === "(auth)";
  const inOnboardingGroup = firstSegment === "(onboarding)";
  const inAppGroup = firstSegment === "(app)";
  const isVerifyOtpScreen = inAuthGroup && currentSegments[1] === "verify-email";
  const inSpacesGroup = firstSegment === "(app)" && currentSegments[1] === "spaces";

  if (!session && pendingEmail && !isVerifyOtpScreen) {
    return { route: "/(auth)/verify-email", params: { email: pendingEmail } };
  }

  if (!session && !inAuthGroup) {
    return { route: "/(auth)/signin" };
  }

  if (session && profile && !profile.email_verified_at && !isVerifyOtpScreen) {
    return { route: "/(auth)/verify-email", params: { email: session.user.email ?? "" } };
  }

  if (session && profile?.email_verified_at && !profile?.onboarding_completed && !inOnboardingGroup) {
    return { route: "/(onboarding)", params: { userId: session.user.id ?? "" } };
  }

  if (hasTwoMembers && (!inAppGroup || inSpacesGroup)) {
    return { route: "/(app)/home" };
  }

  if (session && profile?.email_verified_at && profile.onboarding_completed) {
    if (space === null && !inSpacesGroup) {
      return { route: "/(app)/spaces" };
    }
    if (space && hasTwoMembers === false && !inSpacesGroup) {
      return { route: "/(app)/spaces" };
    }
  }

  return null;
}

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
      try {
        const storedEmail = await AsyncStorage.getItem(
          "pending_verification_email",
        );
        setPendingEmail(storedEmail);
      } catch (error) {
        console.error("Error loading pending email:", error);
      } finally {
        setPendingEmailLoaded(true);
      }
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

    if (needsSpaceResolution && space && (hasTwoMembersLoading || hasTwoMembers === null)) {
      return false;
    }

    return getTargetRoute({
      session,
      profile,
      space,
      hasTwoMembers,
      pendingEmail,
      currentSegments: segments,
    }) !== null;
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

    if (needsSpaceResolution && (!spaceInitialized || spaceLoading)) {
      return;
    }

    if (needsSpaceResolution && space && (hasTwoMembersLoading || hasTwoMembers === null)) {
      return;
    }

    const target = getTargetRoute({
      session,
      profile,
      space,
      hasTwoMembers,
      pendingEmail,
      currentSegments: segments,
    });

    if (target) {
      if (target.params) {
        router.replace({ pathname: target.route as any, params: target.params });
      } else {
        router.replace(target.route as any);
      }
    }
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
        <ErrorBoundary>
          <RootNavigationGate />
        </ErrorBoundary>
      </SpaceProvider>
    </AuthProvider>
  );
}
