import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BrazilStateCitySelector } from "@/components/BrazilStateCitySelector";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { apiRequest } from "@/lib/queryClient";
import {
  Heart, Upload, Camera, TrendingUp, MessageCircle,
  Flame, Snowflake, ThermometerSun, Calendar, Sparkles,
  CheckCircle2, XCircle, Clock, Info, Lock, Target, Users,
} from "lucide-react";
import type { PlanType } from "@shared/schema";

type RelationshipType = "conjuge" | "namorado" | "crush" | "pretendente";

interface PartnerFormData {
  name: string;
  photoBase64: string | null;
  birthDate: string;
  birthTime: string;
  birthState: string;
  birthCity: string;
  relationshipType: RelationshipType;
  howMet: string;
  relationshipDuration: string;
  currentMood: string;
  mainChallenge: string;
  partnerPersonality: string;
  loveLanguage: string;
}

interface RadarCoracaoProps {
  userPlan: PlanType;
}

export function RadarCoracao({ userPlan }: RadarCoracaoProps) {
  const userId = localStorage.getItem("userId");
  const { toast } = useToast();

  const { data: partner, isLoading, isError } = useQuery({
    queryKey: ["/api/users", userId, "partner"],
    enabled: !!userId,
  });

  if (userPlan === "essencia") {
    return (
      <Card data-testid="card-radar-locked">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="font-medium text-lg mb-2" data-testid="text-radar-locked-title">Radar do Coração</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6" data-testid="text-radar-locked-desc">
              Desbloqueie a análise de compatibilidade, alertas diários sobre o clima do relacionamento e previsões de tensões para os próximos 7 dias.
            </p>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" data-testid="badge-radar-plan-required">
              Disponível no Plano Conexão ou superior
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Heart className="h-12 w-12 text-indigo-500 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando Radar do Coração...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card data-testid="card-radar-error">
        <CardContent className="py-12">
          <div className="text-center">
            <Heart className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Ops, algo deu errado</h3>
            <p className="text-muted-foreground text-sm">Não foi possível carregar o Radar do Coração. Tente novamente mais tarde.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!partner) {
    return <PartnerRegistrationForm />;
  }

  return <RadarDashboard partner={partner} />;
}

function PartnerRegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: "",
    photoBase64: null,
    birthDate: "",
    birthTime: "",
    birthState: "",
    birthCity: "",
    relationshipType: "namorado",
    howMet: "",
    relationshipDuration: "",
    currentMood: "",
    mainChallenge: "",
    partnerPersonality: "",
    loveLanguage: "",
  });

  const userId = localStorage.getItem("userId");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPartner = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const res = await apiRequest("POST", `/api/users/${userId}/partner`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "partner"] });
      toast({
        title: "Parceiro cadastrado!",
        description: "Estamos calculando a compatibilidade...",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao cadastrar",
        description: "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Foto muito grande",
          description: "A foto deve ter no máximo 2MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceedStep1 = formData.name && formData.photoBase64 && formData.relationshipType;
  const canProceedStep2 = formData.birthDate && formData.birthState && formData.birthCity;
  const canSubmit = formData.howMet && formData.partnerPersonality;

  const relationshipOptions: { value: RelationshipType; label: string; icon: typeof Heart; desc: string }[] = [
    { value: "conjuge", label: "Cônjuge", icon: Heart, desc: "Casado(a)" },
    { value: "namorado", label: "Namorado(a)", icon: Heart, desc: "Namoro sério" },
    { value: "crush", label: "Crush", icon: Sparkles, desc: "Paquera/Interesse" },
    { value: "pretendente", label: "Pretendente", icon: Heart, desc: "Conhecendo" },
  ];

  return (
    <div className="max-w-lg mx-auto" data-testid="container-partner-registration">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-medium mb-2" data-testid="text-radar-title">Radar do Coração</h1>
        <p className="text-muted-foreground text-sm" data-testid="text-radar-subtitle">
          Vamos conhecer melhor sobre seu relacionamento para oferecer orientações precisas
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-8" data-testid="progress-steps">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full transition-colors ${
              s === step ? "bg-indigo-500" : s < step ? "bg-indigo-200 dark:bg-indigo-700" : "bg-muted"
            }`}
            data-testid={`step-indicator-${s}`}
          />
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                <h2 className="text-xl font-medium mb-1" data-testid="text-step1-title">Quem é essa pessoa especial?</h2>
                <p className="text-sm text-muted-foreground">Vamos começar com o básico</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-pink-100 dark:border-pink-900/30">
                    {formData.photoBase64 ? (
                      <AvatarImage src={formData.photoBase64} alt="Foto do parceiro" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-pink-100 to-indigo-100 dark:from-pink-900/30 dark:to-indigo-900/30">
                        <Camera className="h-12 w-12 text-pink-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    data-testid="label-partner-photo-upload"
                  >
                    <Upload className="h-8 w-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      data-testid="input-partner-photo"
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {formData.photoBase64 ? "Clique para trocar a foto" : "Adicione uma foto (obrigatório)"}
                </p>
                <p className="text-xs text-muted-foreground">Máximo 2MB</p>
              </div>

              <div>
                <Label>Nome completo *</Label>
                <Input
                  placeholder="Nome do(a) parceiro(a)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-partner-name"
                />
              </div>

              <div>
                <Label className="mb-3 block">Tipo de relacionamento *</Label>
                <RadioGroup
                  value={formData.relationshipType}
                  onValueChange={(v) => setFormData({ ...formData, relationshipType: v as RelationshipType })}
                  className="grid grid-cols-2 gap-3"
                  data-testid="radio-relationship-type"
                >
                  {relationshipOptions.map((opt) => (
                    <Label key={opt.value} htmlFor={opt.value} className="cursor-pointer">
                      <div className={`flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${
                        formData.relationshipType === opt.value
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                          : "border-border"
                      }`}>
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <div>
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                data-testid="button-step1-next"
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <h2 className="text-xl font-medium mb-1" data-testid="text-step2-title">Dados astrológicos</h2>
                <p className="text-sm text-muted-foreground">Precisamos disso para calcular a compatibilidade</p>
              </div>

              <div>
                <Label>Data de nascimento *</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  data-testid="input-partner-birthdate"
                />
              </div>

              <div>
                <Label>Hora de nascimento</Label>
                <Input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  data-testid="input-partner-birthtime"
                />
                <p className="text-xs text-muted-foreground mt-1">Opcional, mas melhora a precisão</p>
              </div>

              <BrazilStateCitySelector
                onStateChange={(state) => setFormData({ ...formData, birthState: state })}
                onCityChange={(city) => setFormData({ ...formData, birthCity: city })}
                selectedState={formData.birthState}
                selectedCity={formData.birthCity}
                label="Local de nascimento"
              />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)} data-testid="button-step2-back">
                  Voltar
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!canProceedStep2} data-testid="button-step2-next">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <h2 className="text-xl font-medium mb-1" data-testid="text-step3-title">Conte-nos mais sobre o relacionamento</h2>
                <p className="text-sm text-muted-foreground">Quanto mais detalhes, melhores serão nossas orientações</p>
              </div>

              <div>
                <Label>Como vocês se conheceram? *</Label>
                <Textarea
                  placeholder="Ex: Nos conhecemos no trabalho, começamos como amigos..."
                  rows={3}
                  value={formData.howMet}
                  onChange={(e) => setFormData({ ...formData, howMet: e.target.value })}
                  data-testid="input-how-met"
                />
              </div>

              <div>
                <Label>Há quanto tempo estão juntos?</Label>
                <Input
                  placeholder="Ex: 2 anos, 6 meses, Ainda não estamos juntos..."
                  value={formData.relationshipDuration}
                  onChange={(e) => setFormData({ ...formData, relationshipDuration: e.target.value })}
                  data-testid="input-duration"
                />
              </div>

              <div>
                <Label>Como está o relacionamento atualmente?</Label>
                <Textarea
                  placeholder="Ex: Está tudo bem, mas às vezes brigamos por bobeira..."
                  rows={3}
                  value={formData.currentMood}
                  onChange={(e) => setFormData({ ...formData, currentMood: e.target.value })}
                  data-testid="input-current-mood"
                />
              </div>

              <div>
                <Label>Qual o maior desafio do relacionamento?</Label>
                <Input
                  placeholder="Ex: Falta de comunicação, ciúmes, distância..."
                  value={formData.mainChallenge}
                  onChange={(e) => setFormData({ ...formData, mainChallenge: e.target.value })}
                  data-testid="input-main-challenge"
                />
              </div>

              <div>
                <Label>Como é a personalidade do(a) {formData.name || "parceiro(a)"}? *</Label>
                <Textarea
                  placeholder="Ex: É uma pessoa calma, introvertida, gosta de estar em casa..."
                  rows={3}
                  value={formData.partnerPersonality}
                  onChange={(e) => setFormData({ ...formData, partnerPersonality: e.target.value })}
                  data-testid="input-personality"
                />
              </div>

              <div>
                <Label>Qual a linguagem do amor do(a) {formData.name || "parceiro(a)"}?</Label>
                <Input
                  placeholder="Ex: Palavras de afirmação, tempo de qualidade, presentes..."
                  value={formData.loveLanguage}
                  onChange={(e) => setFormData({ ...formData, loveLanguage: e.target.value })}
                  data-testid="input-love-language"
                />
                <p className="text-xs text-muted-foreground mt-1">Se não sabe, deixe em branco</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)} data-testid="button-step3-back">
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => createPartner.mutate(formData)}
                  disabled={!canSubmit || createPartner.isPending}
                  data-testid="button-submit-partner"
                >
                  {createPartner.isPending ? "Calculando..." : "Finalizar Cadastro"}
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RadarDashboard({ partner }: { partner: any }) {
  const { data: todayInsight } = useQuery({
    queryKey: ["/api/partner", partner.id, "insight/today"],
  });

  const { data: forecast7Days } = useQuery({
    queryKey: ["/api/partner", partner.id, "forecast"],
  });

  const safeArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return []; }
    }
    return [];
  };

  const rawInsight = todayInsight || {
    temperatureScore: 75,
    temperatureLabel: "Quente",
    dayQuality: "good",
    mainMessage: "Hoje é um bom dia para conversas profundas. Vênus está favorável!",
    favorableTopics: ["planos futuros", "demonstrações de carinho", "viagens"],
    avoidTopics: ["dinheiro", "ex-relacionamentos", "críticas"],
    bestTimeToTalk: "à noite, após 20h",
    astrologicalInfluences: {
      mainPlanet: "Vênus",
      aspect: "Trígono com sua Lua",
      effect: "Favorece romantismo e compreensão",
    },
  };

  const insight = {
    ...rawInsight,
    favorableTopics: safeArray(rawInsight.favorableTopics),
    avoidTopics: safeArray(rawInsight.avoidTopics),
  };

  const compatibility = partner.compatibilityBreakdown
    ? JSON.parse(partner.compatibilityBreakdown)
    : { communication: 90, intimacy: 82, conflicts: 75, goals: 88, values: 85 };

  const overallScore = partner.compatibilityScore || 85;

  const forecast = (forecast7Days as any[]) || [];

  const relationshipTypeLabels: Record<string, string> = {
    conjuge: "Cônjuge",
    namorado: "Namorado(a)",
    crush: "Crush",
    pretendente: "Pretendente",
  };

  const getTemperatureIcon = (score: number) => {
    if (score >= 75) return <Flame className="h-12 w-12 text-white" />;
    if (score >= 50) return <ThermometerSun className="h-12 w-12 text-white" />;
    return <Snowflake className="h-12 w-12 text-white" />;
  };

  const getTemperatureGradient = (score: number) => {
    if (score >= 75) return "from-orange-400 to-red-500";
    if (score >= 50) return "from-yellow-400 to-orange-500";
    if (score >= 25) return "from-blue-300 to-yellow-400";
    return "from-blue-500 to-blue-300";
  };

  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      excellent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      good: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      careful: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      avoid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[quality] || colors.neutral;
  };

  const getQualityLabel = (quality: string) => {
    const labels: Record<string, string> = {
      excellent: "Excelente",
      good: "Bom",
      neutral: "Neutro",
      careful: "Cuidado",
      avoid: "Evitar",
    };
    return labels[quality] || "Neutro";
  };

  return (
    <div className="space-y-6" data-testid="container-radar-dashboard">
      <Card data-testid="card-partner-header">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Avatar className="w-20 h-20 border-4 border-pink-200 dark:border-pink-800">
              {partner.photoBase64 ? (
                <AvatarImage src={partner.photoBase64} alt={partner.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-pink-100 to-indigo-100 dark:from-pink-900/30 dark:to-indigo-900/30">
                  <Heart className="h-10 w-10 text-pink-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-2xl font-medium" data-testid="text-partner-name">{partner.name}</h2>
                <Badge variant="secondary" data-testid="badge-relationship-type">
                  {relationshipTypeLabels[partner.relationshipType] || partner.relationshipType}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm" data-testid="text-partner-sign">
                {partner.sunSign} {partner.birthDate ? `\u2022 ${new Date(partner.birthDate).toLocaleDateString("pt-BR")}` : ""}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400" data-testid="text-compatibility-score">{overallScore}%</div>
              <p className="text-sm text-muted-foreground">Compatibilidade</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="w-full" data-testid="tabs-radar">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
          <TabsTrigger value="today" data-testid="tab-today">Hoje</TabsTrigger>
          <TabsTrigger value="compatibility" data-testid="tab-compatibility">Compatibilidade</TabsTrigger>
          <TabsTrigger value="forecast" data-testid="tab-forecast">7 dias</TabsTrigger>
          <TabsTrigger value="chat" data-testid="tab-chat">Perguntas</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6" data-testid="tab-content-today">
          <Card data-testid="card-thermometer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="h-5 w-5 text-orange-500" />
                Termômetro do Relacionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getTemperatureGradient(insight.temperatureScore)} mb-3`}>
                  {getTemperatureIcon(insight.temperatureScore)}
                </div>
                <h3 className="text-3xl font-bold" data-testid="text-temperature-label">{insight.temperatureLabel}</h3>
                <p className="text-muted-foreground" data-testid="text-temperature-score">Temperatura atual: {insight.temperatureScore}°</p>
              </div>

              <div className="relative h-4 rounded-full overflow-hidden mb-2" style={{
                background: "linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #ef4444, #dc2626)"
              }}>
                <div
                  className="absolute top-0 h-full w-1 bg-white rounded-full shadow-md"
                  style={{ left: `${insight.temperatureScore}%`, transform: "translateX(-50%)" }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground gap-1">
                <span className="flex items-center gap-1"><Snowflake className="h-3 w-3" /> Gelado</span>
                <span className="flex items-center gap-1"><ThermometerSun className="h-3 w-3" /> Morno</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> Quente</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-red-500" /> Fervendo</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-day-prediction">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Previsão para Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-md">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Mensagem do dia
                </p>
                <p className="text-sm" data-testid="text-main-message">{insight.mainMessage}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-md">
                  <p className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Assuntos favoráveis
                  </p>
                  <ul className="space-y-1" data-testid="list-favorable-topics">
                    {(insight.favorableTopics || []).map((topic: string, i: number) => (
                      <li key={i} className="text-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-md">
                  <p className="font-medium mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                    <XCircle className="h-4 w-4" />
                    Evite falar sobre
                  </p>
                  <ul className="space-y-1" data-testid="list-avoid-topics">
                    {(insight.avoidTopics || []).map((topic: string, i: number) => (
                      <li key={i} className="text-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {insight.bestTimeToTalk && (
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-md">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Melhor horário para conversar
                  </p>
                  <p className="text-sm" data-testid="text-best-time">{insight.bestTimeToTalk}</p>
                </div>
              )}

              {insight.astrologicalInfluences && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-600" />
                    Influência Astrológica
                  </p>
                  <p className="text-sm" data-testid="text-astrological-influence">
                    <strong>{insight.astrologicalInfluences.mainPlanet}:</strong>{" "}
                    {insight.astrologicalInfluences.aspect} - {insight.astrologicalInfluences.effect}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-6" data-testid="tab-content-compatibility">
          <Card data-testid="card-compatibility">
            <CardHeader>
              <CardTitle>Análise de Compatibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-2" data-testid="text-overall-score">
                  {overallScore}%
                </div>
                <p className="text-muted-foreground">Compatibilidade Geral</p>
                <Progress value={overallScore} className="h-3 mt-4" />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(compatibility).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    communication: "Comunicação",
                    intimacy: "Intimidade",
                    conflicts: "Gestão de Conflitos",
                    goals: "Objetivos em Comum",
                    values: "Valores Compartilhados",
                  };

                  const icons: Record<string, typeof MessageCircle> = {
                    communication: MessageCircle,
                    intimacy: Heart,
                    conflicts: TrendingUp,
                    goals: Target,
                    values: Users,
                  };

                  const Icon = icons[key] || Sparkles;

                  return (
                    <Card key={key} data-testid={`card-compat-${key}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className="h-5 w-5 text-indigo-500" />
                          {labels[key] || key}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-semibold mb-2" data-testid={`text-compat-${key}`}>{value as number}%</div>
                        <Progress value={value as number} className="h-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-3" data-testid="tab-content-forecast">
          {forecast.length > 0 ? forecast.map((day: any, i: number) => (
            <Card key={i} data-testid={`card-forecast-day-${i}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getQualityColor(day.quality)}`}>
                    <Heart className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium">{day.date}</h3>
                      <span className="text-xs text-muted-foreground">{day.dateFormatted}</span>
                      <Badge variant="secondary" className="text-xs">{day.temperature}°</Badge>
                      <Badge className={`text-xs ${getQualityColor(day.quality)}`}>{getQualityLabel(day.quality)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{day.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-indigo-300" />
              <p>Carregando previsão dos próximos 7 dias...</p>
            </div>
          )}

          {forecast.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4">
              {[
                { label: "Excelente", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                { label: "Bom", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                { label: "Neutro", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
                { label: "Cuidado", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
              ].map((legend) => (
                <div key={legend.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${legend.color}`} />
                  <span className="text-xs text-muted-foreground">{legend.label}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" data-testid="tab-content-chat">
          <PartnerChat partnerId={partner.id} partnerName={partner.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PartnerChat({ partnerId, partnerName }: { partnerId: string; partnerName: string }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const userId = localStorage.getItem("userId");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/partner", partnerId, "questions"],
  });

  const { data: questionCount = 0 } = useQuery({
    queryKey: ["/api/partner", partnerId, "questions/count"],
  });

  const remainingQuestions = 3 - (questionCount as number);

  const handleSendQuestion = async (content: string) => {
    if (remainingQuestions <= 0) {
      toast({
        title: "Limite atingido",
        description: "Você já fez 3 perguntas hoje sobre seu parceiro",
        variant: "destructive",
      });
      return;
    }

    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(`/api/partner/${partnerId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content, userId }),
      });

      if (!response.ok) throw new Error("Erro ao enviar pergunta");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.done) {
              setIsStreaming(false);
              setStreamingContent("");
              queryClient.invalidateQueries({ queryKey: ["/api/partner", partnerId, "questions"] });
              queryClient.invalidateQueries({ queryKey: ["/api/partner", partnerId, "questions/count"] });
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (error: any) {
      setIsStreaming(false);
      setStreamingContent("");
      toast({
        title: "Erro ao enviar pergunta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-testid="card-partner-chat">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-500" />
            Perguntas sobre {partnerName}
          </CardTitle>
          <Badge variant={remainingQuestions > 0 ? "default" : "destructive"} data-testid="badge-questions-remaining">
            {remainingQuestions}/3 perguntas hoje
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] mb-4">
          <div className="space-y-4">
            {(questions as any[]).length === 0 && !isStreaming ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="container-chat-empty">
                <Heart className="h-12 w-12 mx-auto mb-3 text-pink-300" />
                <p>Faça perguntas sobre seu relacionamento com {partnerName}</p>
                <p className="text-sm mt-1">Você tem 3 perguntas por dia</p>
              </div>
            ) : (
              <>
                {(questions as any[]).map((q: any) => (
                  <div key={q.id}>
                    <ChatMessage
                      role="user"
                      content={q.question}
                      timestamp={new Date(q.createdAt)}
                    />
                    <ChatMessage
                      role="assistant"
                      content={q.answer}
                      timestamp={new Date(q.createdAt)}
                    />
                  </div>
                ))}
                {isStreaming && streamingContent && (
                  <ChatMessage role="assistant" content={streamingContent} />
                )}
                {isStreaming && !streamingContent && (
                  <ChatMessage role="assistant" content="" isLoading />
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <ChatInput
          onSend={handleSendQuestion}
          disabled={isStreaming || remainingQuestions <= 0}
          remainingQuestions={remainingQuestions}
          maxQuestions={3}
          placeholder={`Pergunte sobre seu relacionamento com ${partnerName}...`}
        />
      </CardContent>
    </Card>
  );
}
