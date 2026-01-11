import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#6B7FD7",
    secondary: "#B8C5F2",
    accent: "#FFB4A9",
    success: "#7BC9A7",
    text: "#2D3142",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#6B7FD7",
    link: "#6B7FD7",
    backgroundRoot: "#F7F8FC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F0F2F8",
    backgroundTertiary: "#E5E7EB",
    border: "#E5E7EB",
  },
  dark: {
    primary: "#8B9FE7",
    secondary: "#C8D5F2",
    accent: "#FFB4A9",
    success: "#7BC9A7",
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#8B9FE7",
    link: "#8B9FE7",
    backgroundRoot: "#1A1B1E",
    backgroundDefault: "#2A2C2E",
    backgroundSecondary: "#353739",
    backgroundTertiary: "#404244",
    border: "#404244",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "Manrope_700Bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    fontFamily: "Manrope_700Bold",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "Manrope_600SemiBold",
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    fontFamily: "Manrope_400Regular",
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    fontFamily: "Manrope_400Regular",
  },
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
    fontFamily: "Manrope_500Medium",
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Manrope_400Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "Manrope_400Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Manrope_400Regular, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
