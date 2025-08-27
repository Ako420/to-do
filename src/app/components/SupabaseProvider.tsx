'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import  supabase  from '../lib/config/supabaseclient'
import { Session } from '@supabase/supabase-js'
/* eslint-disable @typescript-eslint/no-explicit-any */
type AuthContextType = {
  session: Session | null
  user: any
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null })

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseProvider')
  }
  return context
}