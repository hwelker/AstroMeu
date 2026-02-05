import { Card, CardContent } from "@/components/ui/card";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { zodiacDescriptions, zodiacElements, getZodiacDateRange, type ZodiacSign } from "@/lib/zodiac";
import { Flame, Mountain, Wind, Droplets } from "lucide-react";

interface ProfileCardProps {
  name: string;
  zodiacSign: ZodiacSign;
  birthDate: string;
  plan: string;
}

const elementIcons = {
  "Fogo": Flame,
  "Terra": Mountain,
  "Ar": Wind,
  "Água": Droplets,
};

const elementColors = {
  "Fogo": "text-orange-500",
  "Terra": "text-emerald-600",
  "Ar": "text-sky-500",
  "Água": "text-blue-500",
};

export function ProfileCard({ name, zodiacSign, birthDate, plan }: ProfileCardProps) {
  const element = zodiacElements[zodiacSign];
  const ElementIcon = elementIcons[element];
  const dateRange = getZodiacDateRange(zodiacSign);
  const description = zodiacDescriptions[zodiacSign];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const planNames: Record<string, string> = {
    essencia: "Plano Essência",
    conexao: "Plano Conexão",
    plenitude: "Plano Plenitude",
  };

  return (
    <Card className="overflow-hidden" data-testid="card-profile">
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-8">
        <div className="flex items-center gap-4">
          <ZodiacIcon sign={zodiacSign} size="lg" className="bg-white/20 backdrop-blur" />
          <div className="text-white">
            <h2 className="text-xl font-medium" data-testid="text-profile-name">{name}</h2>
            <p className="text-white/80 text-sm" data-testid="text-profile-plan">{planNames[plan] || plan}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-medium" data-testid="text-zodiac-sign">{zodiacSign}</p>
            <p className="text-sm text-muted-foreground" data-testid="text-zodiac-date-range">{dateRange}</p>
          </div>
          <div className={`flex items-center gap-2 ${elementColors[element]}`} data-testid="text-zodiac-element">
            <ElementIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{element}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-zodiac-description">
          {description}
        </p>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground" data-testid="text-birth-date">
            Nascimento: {formatDate(birthDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
