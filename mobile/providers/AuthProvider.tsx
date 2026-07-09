import { logOut } from "@/features/auth/api/log-out";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";


type UserProfile = {
  id: string,
  email_verified_at: string | null,
  onboarding_completed: boolean | null
}

type AuthData = {
    loading: boolean,
    session: Session | null,
    profile: UserProfile | null,
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthData>({
    loading: true,
    session: null,
    profile: null,
    refreshProfile: async () => {}
})

interface Props {
    children: React.ReactNode
}

export default function AuthProvider({children}: Props){
    const [loading, setLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null)

    const loadProfile = useCallback(async (userId: string) => {
      const {data, error} = await supabase
      .from("user")
      .select("id, email_verified_at, onboarding_completed")
      .eq("id", userId)
      .maybeSingle()

      if(error){
        console.log("Error loading profile: ", error.message)
        setProfile(null)
        return
      }
      
      if(!data){
        setProfile(null)
        setSession(null)
        await logOut()
        return
      }

      setProfile(data)
    }, [])

    const refreshProfile = useCallback(async () => {
      const {data} = await supabase.auth.getSession()
      const userId = data.session?.user?.id;

      if (!userId) {
        setProfile(null);
        return;
      }                                                                                     
      await loadProfile(userId);
    }, [])

   

    

    useEffect(() => {

        let mounted = true

        async function bootstrap() {
          const { error, data } = await supabase.auth.getSession();

          if (error) {
            console.log("Error getting session: ", error.message);
          }

          if(!mounted) return;
          
          const currentSession = data.session ?? null
          setSession(currentSession)
          
          if(currentSession?.user?.id){
            await loadProfile(currentSession.user.id)
          } else {
            setProfile(null)
          }
          
          if(!mounted) return;

          setLoading(false);
        }

      bootstrap()

      const {data: authListener} = supabase.auth.onAuthStateChange(async (_, session) => {
        setLoading(true)
        setSession(session ?? null)

        if(session?.user?.id){
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)

      })
    
      return () => {
        mounted = false
        authListener?.subscription.unsubscribe()
      }
    }, [])

    const value = useMemo(() => ({
      loading,
      session,
      profile,
      refreshProfile
    }), [loading, session, profile, refreshProfile]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}