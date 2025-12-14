// lib/supabase/supabase-context.tsx
"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  // Create client once and memoize it
  const supabase = useMemo(() => createClient(), []);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
}