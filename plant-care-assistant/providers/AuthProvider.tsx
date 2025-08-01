"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import logger from "@utils/logger";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<
    typeof createClient
  > | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Supabase client
    try {
      const client = createClient();
      setSupabaseClient(client);
    } catch (error) {
      logger.error("Failed to initialize Supabase client:", error);
      setIsLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;

    // Check active user when component mounts
    const getUser = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser();

        if (error) {
          logger.info("No active user session:", error.message);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        logger.error("Error checking user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Refresh the page data when auth state changes
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient, router]);

  const signIn = async (email: string, password: string) => {
    if (!supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabaseClient) {
      throw new Error("Supabase client not initialized");
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in database
        const response = await fetch("/api/auth/create-user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            username,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create user profile");
        }
      }
    } catch (error) {
      if (supabaseClient) {
        // If profile creation fails, try to clean up the auth user
        await supabaseClient.auth.signOut();
        throw error;
      }
    }
  };

  const signOut = async () => {
    if (!supabaseClient) {
      throw new Error("Supabase client not initialized");
    }

    // Call your API logout endpoint to handle server-side session cleanup
    await fetch("/api/auth/logout", { method: "POST" });

    // Then clear client-side session
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    // Redirect to landing page after logout
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
