import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { zodiacElements, zodiacDescriptions, getZodiacDateRange, type ZodiacSign } from "@/lib/zodiac";
import { Sun, Moon, Sunrise, Star, Sparkles } from "lucide-react";

interface MapaAstralProps {
  sunSign: ZodiacSign;
  moonSign?: ZodiacSign | null;
  ascendantSign?: ZodiacSign | null;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
}

interface PlanetPosition {
  planet: string;
  sign: ZodiacSign;
  icon: typeof Star;
}

const mockPlanetPositions: PlanetPosition[] = [
  { planet: "Mercúrio", sign: "Áries", icon: Star },
  { planet: "Vênus", sign: "Touro", icon: Star },
  { planet: "Marte", sign: "Gêmeos", icon: Star },
  { planet: "Júpiter", sign: "Câncer", icon: Star },
  { planet: "Saturno", sign: "Capricórnio", icon: Star },
];

const elementColors: Record<string, string> = {
  "Fogo": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Terra": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Ar": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Água": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export function MapaAstral({
  sunSign,
  moonSign,
  ascendantSign,
  birthDate,
  birthTime,
  birthCity,
}: MapaAstralProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const element = zodiacElements[sunSign];
  const generatedMoon = moonSign || ("Câncer" as ZodiacSign);
  const generatedAscendant = ascendantSign || ("Libra" as ZodiacSign);

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm" data-testid="card-mapa-astral-main">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Seu Mapa Astral</CardTitle>
            <Badge className={elementColors[element]} data-testid="badge-element">
              Elemento {element}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Nascido em {formatDate(birthDate)} {birthTime && `às ${birthTime}`} em {birthCity}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/30" data-testid="card-sun-sign">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Sun className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sol</p>
                <div className="flex items-center gap-2">
                  <ZodiacIcon sign={sunSign} size="sm" />
                  <span className="font-medium text-lg" data-testid="text-sun-sign">{sunSign}</span>
                </div>
                <p className="text-xs text-muted-foreground">{getZodiacDateRange(sunSign)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-950/20 border border-slate-100 dark:border-slate-800" data-testid="card-moon-sign">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Moon className="h-7 w-7 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Lua</p>
                <div className="flex items-center gap-2">
                  <ZodiacIcon sign={generatedMoon} size="sm" />
                  <span className="font-medium text-lg" data-testid="text-moon-sign">{generatedMoon}</span>
                </div>
                <p className="text-xs text-muted-foreground">Emoções e instintos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/30" data-testid="card-ascendant-sign">
              <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Sunrise className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Ascendente</p>
                <div className="flex items-center gap-2">
                  <ZodiacIcon sign={generatedAscendant} size="sm" />
                  <span className="font-medium text-lg" data-testid="text-ascendant-sign">{generatedAscendant}</span>
                </div>
                <p className="text-xs text-muted-foreground">Como você se apresenta</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">Sobre seu signo solar</p>
                <p className="text-sm text-muted-foreground" data-testid="text-sun-description">
                  {zodiacDescriptions[sunSign]}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm" data-testid="card-planet-positions">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Posições Planetárias</CardTitle>
          <p className="text-sm text-muted-foreground">
            Onde cada planeta estava no momento do seu nascimento
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {mockPlanetPositions.map((position) => (
              <div
                key={position.planet}
                className="flex flex-col items-center p-3 rounded-xl border bg-card"
                data-testid={`planet-${position.planet.toLowerCase()}`}
              >
                <Star className="h-5 w-5 text-indigo-500 mb-2" />
                <span className="text-xs text-muted-foreground">{position.planet}</span>
                <div className="flex items-center gap-1 mt-1">
                  <ZodiacIcon sign={position.sign} size="xs" />
                  <span className="text-sm font-medium">{position.sign}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            * Posições aproximadas. Para um mapa completo, inclua seu horário exato de nascimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
