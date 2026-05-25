import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import apiClient from "@/lib/api";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user with backend after authentication
  const syncWithBackend = async () => {
    try {
      console.log('[Auth] Syncing user with backend...');
      await apiClient.get('/api/users/me');
      console.log('[Auth] User synced with backend successfully');
    } catch (error) {
      console.warn('[Auth] Backend sync failed:', error);
    }
  };

  useEffect(() => {
    console.log('[Auth] useAuth hook initializing...');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          emailConfirmed: session?.user?.email_confirmed_at,
          expiresAt: session?.expires_at
        });

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Sync with backend on sign in
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => syncWithBackend(), 0);
        }
      }
    );

    // THEN check for existing session
    console.log('[Auth] Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] Error getting session:', error);
      } else {
        console.log('[Auth] Existing session check:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] signUp called with email:', email);
    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log('[Auth] Email redirect URL:', redirectUrl);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      console.log('[Auth] signUp response:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorStatus: error?.status,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        userConfirmedAt: data?.user?.confirmed_at,
        userEmailConfirmedAt: data?.user?.email_confirmed_at,
        identitiesLength: data?.user?.identities?.length,
        hasSession: !!data?.session,
        sessionExpiresAt: data?.session?.expires_at
      });

      // Log the full response for debugging
      console.log('[Auth] Full signUp data:', JSON.stringify(data, null, 2));

      return { data, error };
    } catch (err) {
      console.error('[Auth] signUp exception:', err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] signIn called with email:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[Auth] signIn response:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorCode: (error as any)?.code,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        userConfirmedAt: data?.user?.confirmed_at,
        hasSession: !!data?.session
      });

      if (error) {
        console.error('[Auth] signIn error details:', {
          name: error.name,
          message: error.message,
          status: error.status,
          fullError: JSON.stringify(error, null, 2)
        });
      }

      return { data, error };
    } catch (err) {
      console.error('[Auth] signIn exception:', err);
      throw err;
    }
  };

  const signOut = async () => {
    console.log('[Auth] signOut called');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] signOut error:', error);
    } else {
      console.log('[Auth] signOut successful');
    }
    return { error };
  };

  // Helper to get current access token
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;
    console.log('[Auth] getAccessToken:', token ? 'Token exists' : 'No token');
    return token;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getAccessToken,
    signInWithGoogle: async () => {
      console.log('[Auth] signInWithGoogle called');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) console.error('[Auth] Google sign in error:', error);
      return { data, error };
    },
    signInWithGithub: async () => {
      console.log('[Auth] signInWithGithub called');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) console.error('[Auth] GitHub sign in error:', error);
      return { data, error };
    },
  };
};
