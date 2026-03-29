// Brand Colors
const primary = "#1A9D7C";
const primaryDark = "#014D3A"; // Dark primary green
const primaryLight = "#4DB39A";
const primaryAlt = "#37B874"; // Alternative brand green
const primaryGradient = "#12FFAA"; // Gradient accent
const secondary = "#6C5CE7";
const accent = "#1A9D7C";

// Status Colors
const success = "#00C853"; // Green for success states
const error = "#EE1045"; // Red for errors/danger
const errorRed = "#E53935"; // Registration error red
const warning = "#FFCC00";
const errorAlt = "#FF3B30"; // Alternative error red
const iosBlue = "#007AFF"; // iOS system blue"

// Special Colors
const gold = "#D4AF37"; // Premium/VIP gold
const liveRed = "#DF3838"; // Live streaming indicator

// Base Colors
const white = "#FFFFFF";
const black = "#121212";
const darkGray = "#262626"; // Registration UI dark gray
const gray1 = "#1A1A1A";
const gray2 = "#1E1E1E";
const gray3 = "#2A2A2A";
const gray4 = "#333333";
const gray5 = "#828282";
const grayLight = "#E0E0E0";
const grayBg = "#F8F9FA";
const greenBg = "#4CAF50"; // Background green

// RGBA Variants - White based
const whiteOpacity04 = "rgba(255, 255, 255, 0.04)";
const whiteOpacity08 = "rgba(255, 255, 255, 0.08)";
const whiteOpacity12 = "rgba(255, 255, 255, 0.12)";
const whiteOpacity16 = "rgba(255, 255, 255, 0.16)";
const whiteOpacity48 = "rgba(255, 255, 255, 0.48)";
const whiteOpacity64 = "rgba(255, 255, 255, 0.64)";

// RGBA Variants - Black based
const blackOpacity0 = "rgba(18, 18, 18, 0)";

const blackOpacity04 = "rgba(18, 18, 18, 0.04)";
const blackOpacity08 = "rgba(18, 18, 18, 0.08)";
const blackOpacity16 = "rgba(18, 18, 18, 0.16)";
const blackOpacity48 = "rgba(18, 18, 18, 0.48)";
const blackOpacity64 = "rgba(18, 18, 18, 0.64)";
const blackOpacity05 = "rgba(0, 0, 0, 0.5)";

// RGBA Variants - Surface/Background
const surfaceBlur = "rgba(38, 38, 38, 0.64)";

// RGBA Variants - Primary based
const primaryDarkOpacity16 = "rgba(1, 77, 58, 0.16)";
const subtitle = "#121212A3";

const lightWhite = "#FFFFFFA3";

export const darkTheme = {
  background: black,
  surface: black,
  surfaceElevated: gray2,
  text: white,
  textSecondary: whiteOpacity64,
  textTertiary: whiteOpacity48,
  border: whiteOpacity08,
  borderLight: whiteOpacity04,
  overlay: blackOpacity05,
  inputBackground: whiteOpacity04,
  cardBackground: whiteOpacity04,
  tabInactive: whiteOpacity48,
  divider: whiteOpacity16,
  lightWhite: lightWhite,
};

export const lightTheme = {
  background: white,
  surface: white,
  surfaceElevated: grayBg,
  text: black,
  textSecondary: blackOpacity64,
  textTertiary: blackOpacity48,
  border: "rgba(18, 18, 18, 0.08)",
  borderLight: "rgba(18, 18, 18, 0.04)",
  overlay: blackOpacity05,
  inputBackground: "rgba(18, 18, 18, 0.04)",
  cardBackground: "rgba(18, 18, 18, 0.04)",
  tabInactive: blackOpacity48,
  divider: blackOpacity16,
  lightWhite: lightWhite,
};

const inputBg = "#1212120A";

export default {
  // Brand colors
  inputBg,
  primary,
  primaryDark,
  primaryLight,
  primaryAlt,
  primaryGradient,
  secondary,
  accent,
  subtitle,

  // Status colors
  success,
  error,
  errorRed,
  warning,
  errorAlt,
  iosBlue,

  // Special colors
  gold,
  liveRed,

  // Base colors
  white,
  black,
  darkGray,
  gray1,
  gray2,
  gray3,
  gray4,
  gray5,
  grayLight,
  grayBg,
  greenBg,

  // RGBA variants
  whiteOpacity04,
  whiteOpacity08,
  whiteOpacity12,
  whiteOpacity16,
  whiteOpacity48,
  whiteOpacity64,
  blackOpacity0,
  blackOpacity04,
  blackOpacity08,
  blackOpacity16,
  blackOpacity48,
  blackOpacity64,
  blackOpacity05,
  surfaceBlur,
  primaryDarkOpacity16,

  // Legacy support (keeping for backward compatibility)
  background: black,
  surface: black,
  surfaceLight: gray2,
  text: white,
  textSecondary: whiteOpacity64,
  textTertiary: whiteOpacity48,
  border: whiteOpacity08,
  overlay: blackOpacity05,

  // Themes
  dark: darkTheme,
  light: lightTheme,
};
