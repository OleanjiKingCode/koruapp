// Common/shared types
export type ThemeMode = "light" | "dark" | "system";

export type Persona = "seeker" | "host";

export type StatusType =
  | "Pending"
  | "Active"
  | "Replied"
  | "Completed"
  | "Refunded"
  | "Expired";

export interface IconProps {
  className?: string;
}

// Color variant types
export type ColorVariant = "purple" | "golden" | "lime";

export interface ColorClasses {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  shadow: string;
  glow: string;
}

export const COLOR_CLASSES: Record<ColorVariant, ColorClasses> = {
  purple: {
    bg: "bg-koru-purple",
    bgLight: "bg-koru-purple/20",
    text: "text-koru-purple",
    border: "border-koru-purple",
    shadow: "shadow-koru-purple/40",
    glow: "shadow-[0_0_40px_rgba(195,133,238,0.4)]",
  },
  golden: {
    bg: "bg-koru-golden",
    bgLight: "bg-koru-golden/20",
    text: "text-koru-golden",
    border: "border-koru-golden",
    shadow: "shadow-koru-golden/40",
    glow: "shadow-[0_0_40px_rgba(218,176,121,0.4)]",
  },
  lime: {
    bg: "bg-koru-lime",
    bgLight: "bg-koru-lime/20",
    text: "text-koru-lime",
    border: "border-koru-lime",
    shadow: "shadow-koru-lime/40",
    glow: "shadow-[0_0_40px_rgba(157,235,97,0.4)]",
  },
};





