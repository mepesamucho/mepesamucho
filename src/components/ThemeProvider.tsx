"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { ThemeContext, getInitialTheme, applyTheme, type Theme } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // Prevent flash of wrong theme — render children only after mount
  // But we still render the structure to avoid layout shift
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div style={{ visibility: mounted ? "visible" : "hidden" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
