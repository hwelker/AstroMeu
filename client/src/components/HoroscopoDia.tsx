import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { type ZodiacSign } from "@/lib/zodiac";
import { Calendar, Heart, Briefcase, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface HoroscopoDiaProps {
  zodiacSign: ZodiacSign;
  userName: string;
}

const mockHoroscope = {
  general: "Hoje é um dia para confiar em sua intuição. Os astros indicam que você pode receber notícias importantes que afetarão suas decisões futuras. Mantenha a mente aberta e o coração receptivo para as oportunidades que surgirem.",
  love: "Vênus está favorecendo seu signo, trazendo harmonia para os relacionamentos. É um bom momento para conversas importantes com pessoas queridas.",
  career: "Mercúrio retrógrado pede cautela com comunicações no trabalho. Revise bem antes de enviar qualquer documento importante.",
  health: "Cuide da sua energia hoje. Reserve momentos para respirar fundo e reconectar com você mesma.",
  luckyNumber: 7,
  luckyColor: "Índigo",
  compatibility: "Touro",
  mood: "Reflexivo",
  intensity: 8,
};

const intensityLabels = [
  "Muito calmo",
  "Calmo",
  "Tranquilo",
  "Equilibrado",
  "Moderado",
  "Ativo",
  "Intenso",
  "Muito intenso",
  "Transformador",
  "Extremo",
];

export function HoroscopoDia({ zodiacSign, userName }: HoroscopoDiaProps) {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm overflow-hidden" data-testid="card-horoscopo-header">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ZodiacIcon sign={zodiacSign} size="lg" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Horóscopo do dia para</p>
              <h2 className="text-2xl font-medium" data-testid="text-horoscopo-sign">{zodiacSign}</h2>
              <p className="text-white/80 text-sm capitalize" data-testid="text-horoscopo-date">{today}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-2">Olá, {firstName}!</p>
              <p className="text-muted-foreground" data-testid="text-horoscopo-general">
                {mockHoroscope.general}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" data-testid="badge-lucky-number">
              Número da sorte: {mockHoroscope.luckyNumber}
            </Badge>
            <Badge variant="secondary" data-testid="badge-lucky-color">
              Cor: {mockHoroscope.luckyColor}
            </Badge>
            <Badge variant="secondary" data-testid="badge-compatibility">
              Afinidade: {mockHoroscope.compatibility}
            </Badge>
            <Badge variant="secondary" data-testid="badge-mood">
              Humor: {mockHoroscope.mood}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border shadow-sm" data-testid="card-horoscopo-love">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Amor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-horoscopo-love">
              {mockHoroscope.love}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm" data-testid="card-horoscopo-career">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-horoscopo-career">
              {mockHoroscope.career}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm" data-testid="card-intensity">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            Intensidade do dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nível de energia</span>
              <span className="font-medium" data-testid="text-intensity-label">
                {intensityLabels[mockHoroscope.intensity - 1]}
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${mockHoroscope.intensity * 10}%` }}
                data-testid="progress-intensity"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {mockHoroscope.health}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
