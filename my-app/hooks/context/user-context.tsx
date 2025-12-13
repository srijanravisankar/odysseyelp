"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
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
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Get the authenticated user session
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return;

      const userId = authData.user.id;
      const email = authData.user.email || "";
      let name = authData.user.user_metadata?.name; // Default to metadata if available
      const avatar = authData.user.user_metadata?.avatar || "/profile-picture.jpg";

      // 2. Fetch the actual profile from the 'users' table
      try {
        const { data: profileData, error: profileError } = await supabase
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

      // 3. Set the state
      setUser({
        name: name || email.split("@")[0] || "Unknown User", // Fallback logic
        email,
        avatar,
      });
    };

    fetchUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // We repeat the fetch logic here to ensure we get the DB name on login
        // Optional: You could extract the fetch logic above into a reusable function
        const { data: profileData } = await supabase
          .from("users")
          .select("name")
          .eq("id", session.user.id)
          .single();
        
        setUser({
          name: profileData?.name || session.user.user_metadata?.name || "Unknown User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar || "/profile-picture.jpg",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}