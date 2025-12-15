"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Group {
  id: number;
  name: string;
  createdAt: string;
  secretCode: string;
}

interface GroupContextType {
  // The currently active group object
  activeGroup: Group | null;
  setActiveGroup: (group: Group | null) => void;
  
  // Controls visibility of the side sheet
  isGroupSheetOpen: boolean;
  setIsGroupSheetOpen: (isOpen: boolean) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);

  return (
    <GroupContext.Provider 
      value={{ 
        activeGroup, 
        setActiveGroup, 
        isGroupSheetOpen, 
        setIsGroupSheetOpen 
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}