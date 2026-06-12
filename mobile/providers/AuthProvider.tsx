import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js"
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthData = {
    loading: boolean,
    session: Session | null;
}

const AuthContext = createContext<AuthData>({
    loading: true,
    session: null
})

interface Props {
    children: React.ReactNode
}

export default function AuthProvider({children}: Props){
    const [loading, setLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);

    

    useEffect(() => {

        let mounted = true

        async function bootstrap() {
          const { error, data } = await supabase.auth.getSession();

          if (error) {
            console.log("Error getting session: ", error.message);
          }

          if(!mounted) return;

          setSession(data.session ?? null)

          setLoading(false);
        }

      bootstrap()

      const {data: authListener} = supabase.auth.onAuthStateChange(async (_, session) => {
        setSession(session ?? null)
        setLoading(false)

      })
    
      return () => {
        mounted = false
        authListener?.subscription.unsubscribe()
      }
    }, [])

    const value = useMemo(() => ({loading, session}), [loading, session])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)