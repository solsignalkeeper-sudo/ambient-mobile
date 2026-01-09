import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSettings } from "@/lib/hooks";

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { data: settings } = useSettings();
  
  const themeMode = settings?.themeMode ?? "system";
  
  let colorScheme: "light" | "dark";
  if (themeMode === "system") {
    colorScheme = systemColorScheme ?? "light";
  } else {
    colorScheme = themeMode;
  }
  
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme];

  return {
    theme,
    isDark,
    themeMode,
  };
}
