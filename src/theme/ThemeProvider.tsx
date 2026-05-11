import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { Appearance } from "react-native";
import { darkColors, lightColors, type AppColors } from "./colors";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  colors: AppColors;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "pianosense-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTheme === "light" || savedTheme === "dark") {
          setThemeState(savedTheme);
          return;
        }

        const systemTheme = Appearance.getColorScheme();
        setThemeState(systemTheme === "dark" ? "dark" : "light");
      } catch (error) {
        console.error("LOAD THEME ERROR:", error);
        setThemeState("light");
      } finally {
        setReady(true);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (nextTheme: ThemeMode) => {
    try {
      setThemeState(nextTheme);
      await AsyncStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("SET THEME ERROR:", error);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    await setTheme(nextTheme);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      theme,
      colors,
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  if (!ready) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}