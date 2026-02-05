import { type ZodiacSign } from "@/lib/zodiac";
import { 
  Flame, 
  Mountain, 
  Wind, 
  Droplets,
  Circle,
  Sparkles
} from "lucide-react";

interface ZodiacIconProps {
  sign: ZodiacSign;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const zodiacSymbols: Record<ZodiacSign, string> = {
  "Áries": "AR",
  "Touro": "TO",
  "Gêmeos": "GE",
  "Câncer": "CA",
  "Leão": "LE",
  "Virgem": "VI",
  "Libra": "LI",
  "Escorpião": "ES",
  "Sagitário": "SA",
  "Capricórnio": "CP",
  "Aquário": "AQ",
  "Peixes": "PE",
};

export function ZodiacIcon({ sign, size = "md", className = "" }: ZodiacIconProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 ${sizeClasses[size]} ${className}`}
      data-testid={`zodiac-icon-${sign.toLowerCase().replace(/[êá]/g, 'a')}`}
    >
      <span className={`font-semibold text-indigo-600 dark:text-indigo-400 ${size === "xl" ? "text-xl" : size === "lg" ? "text-base" : size === "md" ? "text-sm" : size === "sm" ? "text-xs" : "text-[10px]"}`}>
        {zodiacSymbols[sign]}
      </span>
    </div>
  );
}
