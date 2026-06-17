import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js"
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


type UserProfile = {
  id: string,
  email_verified_at: string | null
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

    async function loadProfile(userId: string){
      const {data, error} = await supabase
      .from("user")
      .select("id, email_verified_at")
      .eq("id", userId)
      .single()

      if(error){
        console.log("Error loading profile: ", error.message)
        setProfile(null)
        return
      }
      setProfile(data)
    }

    async function refreshProfile(){
      const userId = session?.user?.id

      if(!userId){
        setProfile(null)
        return
      }
      await loadProfile(userId)
      console.log(profile)
    }

    

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
    }), [loading, session, profile]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)