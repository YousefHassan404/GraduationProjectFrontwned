import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:border-slate-200 light:bg-white light:hover:bg-slate-100 transition-all duration-300"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun size={16} className="text-yellow-400" />
      ) : (
        <Moon size={16} className="text-slate-600" />
      )}
      <span className="hidden sm:inline text-xs">
        {isDark ? "Light" : "Dark"}
      </span>
    </Button>
  );
}
