import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/providers/AuthProvider";
import { createSpaceWithInvite } from "@/features/spaces/api/create-space";
import { getMySpace } from "@/features/spaces/api/get-my-space";
import { supabase } from "@/lib/supabase";

export type Space = {
  id: string;
  name: string;
  role: "owner" | "member";
  known_date: string | null;
  official_date: string | null;
};

type CreateSpaceResult = {
  space_id: string;
  invitation_code: string;
  already_exists: boolean;
};

type SpaceContextValue = {
  space: Space | null;
  loading: boolean;
  initialized: boolean;
  syncVersion: number;
  refreshSpace: () => Promise<Space | null>;
  initializeSpace: () => Promise<CreateSpaceResult>;
  clearSpace: () => void;
};

const SpaceContext = createContext<SpaceContextValue | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const { session, profile } = useAuth();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);


  const clearSpace = useCallback(() => {
    setSpace(null);
    setLoading(false);
    setInitialized(true);
  }, []);
  
  const refreshSpace = useCallback(async (): Promise<Space | null> => {
    if (!session) {
      setSpace(null);
      setLoading(false);
      setInitialized(true);
      return null;
    }
    
    setLoading(true);
    
    try {
      const result = await getMySpace(session.user.id);
      
      if (!result?.space) {
        setSpace(null);
        return null;
      }
      
      const nextSpace: Space = {
        id: result.space.id,
        name: result.space.name,
        role: result.role,
        known_date: result.space.known_date,
        official_date: result.space.official_date,
      };

      setSpace(nextSpace);
      return nextSpace;
    } catch (error) {
      setSpace(null);
      throw error;
    } finally {
      setSyncVersion((currentVersion) => currentVersion + 1);
      setLoading(false);
      setInitialized(true);
    }
  }, [session]);
  
  const initializeSpace = useCallback(async (): Promise<CreateSpaceResult> => {
    const result = await createSpaceWithInvite();
    await refreshSpace();
    return result;
  }, [refreshSpace]);

  useEffect(() => {
    if (!session) {
      setSpace(null);
      setLoading(false);
      setInitialized(false);
      return;
    }

    if (!profile) {
      setLoading(true);
      setInitialized(false);
      return;
    }

    if (!profile.onboarding_completed) {
      setSpace(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    setLoading(true);
    setInitialized(false);

    refreshSpace().catch(() => {
      setSpace(null);
      setLoading(false);
      setInitialized(true);
    });
  }, [session, profile, profile?.onboarding_completed, refreshSpace]);

  useEffect(() => {
    if (!session || !space?.id) return;

    const channel = supabase.channel(`space-member-${space.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "space_member",
        filter: `space_id=eq.${space.id}`,
      },
      () => {
        refreshSpace();
      },
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, space?.id, refreshSpace]);

  const value = useMemo<SpaceContextValue>(
    () => ({
      space,
      loading,
      initialized,
      syncVersion,
      refreshSpace,
      initializeSpace,
      clearSpace,
    }),
    [space, loading, initialized, syncVersion, refreshSpace, initializeSpace, clearSpace],
  );

  return (
    <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);

  if (!context) {
    throw new Error("useSpace must be used within a SpaceProvider");
  }

  return context;
}
