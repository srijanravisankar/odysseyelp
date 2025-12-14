"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useSupabase } from "./supabase-context";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);

  // 1. Define a reusable fetch function (memoized)
  const fetchUserProfile = useCallback(async (sessionUser: any) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }

    const userId = sessionUser.id;
    const email = sessionUser.email || "";
    let name = sessionUser.user_metadata?.name;
    const avatar = sessionUser.user_metadata?.avatar || "/profile-picture.jpg";

    try {
      // Fetch profile from DB
      const { data: profileData } = await supabase
        .from("users")
        .select("name")
        .eq("id", userId)
        .single();

      if (profileData && profileData.name) {
        name = profileData.name;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }

    // Update State
    setUser({
      id: userId,
      name: name || email.split("@")[0] || "Unknown User",
      email,
      avatar,
    });
  }, [supabase]);

  useEffect(() => {
    // 2. Initial Fetch on Mount
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        fetchUserProfile(data.user);
      }
    };
    initUser();

    // 3. Listener (Synchronous Wrapper)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // 🛑 FIX: Do NOT use 'async' here. Just call the function.
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}