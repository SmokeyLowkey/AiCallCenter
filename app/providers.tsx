"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { TeamProvider } from "@/contexts/TeamContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure theme is only applied after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TeamProvider>
          <SocketProvider>
            {mounted && children}
          </SocketProvider>
        </TeamProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}