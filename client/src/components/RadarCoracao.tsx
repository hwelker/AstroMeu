import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { getZodiacSign, type ZodiacSign } from "@/lib/zodiac";
import { BrazilStateCitySelector } from "@/components/BrazilStateCitySelector";
import { Heart, Plus, AlertTriangle, Calendar, MessageCircle, Clock, TrendingUp, Sparkles, Lock, Upload } from "lucide-react";
import type { Partner, PlanType } from "@shared/schema";

interface RadarCoracaoProps {
  userPlan: PlanType;
  partners: Partner[];
  onAddPartner?: (data: { name: string; birthDate: string; birthCity: string; birthState?: string; photoBase64?: string }) => void;
}

interface DayForecast {
  day: string;
  date: string;
  mood: "otimo" | "bom" | "neutro" | "tenso" | "critico";
  tip: string;
}

const moodColors = {
  otimo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  bom: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  neutro: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  tenso: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critico: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const moodLabels = {
  otimo: "Ótimo",
  bom: "Bom",
  neutro: "Neutro",
  tenso: "Tenso",
  critico: "Crítico",
};

const mockWeekForecast: DayForecast[] = [
  { day: "Hoje", date: "05/02", mood: "bom", tip: "Dia favorável para conversas importantes" },
  { day: "Qui", date: "06/02", mood: "otimo", tip: "Energia harmoniosa, aproveite para fazer planos juntos" },
  { day: "Sex", date: "07/02", mood: "neutro", tip: "Dia tranquilo, mantenha a rotina" },
  { day: "Sáb", date: "08/02", mood: "tenso", tip: "Lua em quadratura, evite cobranças" },
  { day: "Dom", date: "09/02", mood: "bom", tip: "Bom dia para atividades românticas" },
  { day: "Seg", date: "10/02", mood: "neutro", tip: "Foque no diálogo claro" },
  { day: "Ter", date: "11/02", mood: "otimo", tip: "Vênus favorece declarações" },
];

const mockCompatibilityAreas = [
  { area: "Comunicação", score: 85 },
  { area: "Intimidade", score: 72 },
  { area: "Objetivos", score: 68 },
  { area: "Conflitos", score: 45 },
];

export function RadarCoracao({ userPlan, partners, onAddPartner }: RadarCoracaoProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", birthDate: "", birthCity: "", birthState: "" });
  const [partnerPhoto, setPartnerPhoto] = useState<string | null>(null);

  const isLocked = userPlan === "essencia";
  const hasPartner = partners.length > 0;
  const activePartner = partners[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPartner = () => {
    if (onAddPartner && newPartner.name && newPartner.birthDate && newPartner.birthCity) {
      onAddPartner({
        ...newPartner,
        photoBase64: partnerPhoto || undefined,
      });
      setNewPartner({ name: "", birthDate: "", birthCity: "", birthState: "" });
      setPartnerPhoto(null);
      setAddDialogOpen(false);
    }
  };

  if (isLocked) {
    return (
      <Card className="border shadow-sm" data-testid="card-radar-locked">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="font-medium text-lg mb-2">Radar do Coração</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Desbloqueie a análise de compatibilidade, alertas diários sobre o clima do relacionamento e previsões de tensões para os próximos 7 dias.
            </p>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              Disponível no Plano Conexão ou superior
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasPartner) {
    return (
      <Card className="border shadow-sm" data-testid="card-radar-empty">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-medium text-lg mb-2">Radar do Coração</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Cadastre os dados do seu parceiro ou pretendente para receber análises de compatibilidade e alertas personalizados.
            </p>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-partner">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Parceiro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Parceiro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col items-center mb-2">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-2 border-pink-100">
                        {partnerPhoto ? (
                          <AvatarImage src={partnerPhoto} alt="Foto do parceiro" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-pink-100 to-indigo-100">
                            <Heart className="h-8 w-8 text-pink-400" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" data-testid="label-partner-photo-upload">
                        <Upload className="h-6 w-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          data-testid="input-partner-photo"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Foto do parceiro</p>
                    <p className="text-xs text-muted-foreground">(Opcional)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partner-name">Nome</Label>
                    <Input
                      id="partner-name"
                      placeholder="Nome do parceiro"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      data-testid="input-partner-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partner-birth">Data de nascimento</Label>
                    <Input
                      id="partner-birth"
                      type="date"
                      value={newPartner.birthDate}
                      onChange={(e) => setNewPartner({ ...newPartner, birthDate: e.target.value })}
                      data-testid="input-partner-birth"
                    />
                  </div>

                  <BrazilStateCitySelector
                    onStateChange={(state) => setNewPartner((prev) => ({ ...prev, birthState: state }))}
                    onCityChange={(city) => setNewPartner((prev) => ({ ...prev, birthCity: city }))}
                    selectedState={newPartner.birthState}
                    selectedCity={newPartner.birthCity}
                    label="Local de nascimento do parceiro"
                  />

                  <Button className="w-full" onClick={handleAddPartner} data-testid="button-save-partner">
                    Calcular Compatibilidade
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  const partnerSign = (activePartner.sunSign as ZodiacSign) || getZodiacSign(activePartner.birthDate);
  const compatibilityScore = activePartner.compatibilityScore || 76;

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm overflow-hidden" data-testid="card-radar-main">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-7 w-7" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Análise com</p>
                <h2 className="text-xl font-medium" data-testid="text-partner-name">{activePartner.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <ZodiacIcon sign={partnerSign} size="sm" />
                  <span className="text-sm text-white/90" data-testid="text-partner-sign">{partnerSign}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold" data-testid="text-compatibility-score">{compatibilityScore}</div>
              <p className="text-white/80 text-sm">Score de compatibilidade</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {mockCompatibilityAreas.map((area) => (
              <div key={area.area} className="text-center" data-testid={`area-${area.area.toLowerCase()}`}>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{area.score}%</div>
                <p className="text-xs text-muted-foreground">{area.area}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">Insight do relacionamento</p>
                <p className="text-sm text-muted-foreground" data-testid="text-relationship-insight">
                  A combinação do seu Sol em Áries com a Lua em Câncer do {activePartner.name} cria uma dinâmica interessante: você traz energia e iniciativa, enquanto ele/ela oferece acolhimento emocional.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm" data-testid="card-today-alert">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-indigo-500" />
            Alerta de hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge className={moodColors.bom} data-testid="badge-today-mood">
              Clima: {moodLabels.bom}
            </Badge>
            <Badge variant="outline" data-testid="badge-best-time">
              <Clock className="h-3 w-3 mr-1" />
              Melhor horário: 19h-21h
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Favorável para conversar sobre:</p>
                <p className="text-sm text-muted-foreground">Planos futuros, viagens, projetos em comum</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Evite hoje:</p>
                <p className="text-sm text-muted-foreground">Cobranças sobre compromisso, discussões sobre passado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm" data-testid="card-week-forecast">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            Previsão dos próximos 7 dias
          </CardTitle>
          <CardDescription>Clima do relacionamento dia a dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {mockWeekForecast.map((day, index) => (
              <div
                key={index}
                className="text-center p-2 rounded-lg border hover-elevate cursor-pointer"
                title={day.tip}
                data-testid={`forecast-day-${index}`}
              >
                <p className="text-xs text-muted-foreground">{day.day}</p>
                <p className="text-xs font-medium mb-2">{day.date}</p>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${moodColors[day.mood]}`}>
                  <Heart className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {Object.entries(moodLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${moodColors[key as keyof typeof moodColors]}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
