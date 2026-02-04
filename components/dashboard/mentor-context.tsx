"use client";

import React, { createContext, useContext, useState } from "react";

interface MentorContextType {
  pendingQuestion: string | null;
  setPendingQuestion: (question: string | null) => void;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export function MentorProvider({ children }: { children: React.ReactNode }) {
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  return (
    <MentorContext.Provider value={{ pendingQuestion, setPendingQuestion }}>
      {children}
    </MentorContext.Provider>
  );
}

export function useMentorContext() {
  const context = useContext(MentorContext);
  if (context === undefined) {
    throw new Error("useMentorContext must be used within a MentorProvider");
  }
  return context;
}
