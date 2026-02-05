import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MessageSquare, User, CreditCard, Sparkles, Menu, LogOut, Map, Sun, Heart, BookOpen, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { AudioPopup } from "@/components/AudioPopup";
import { ProfileCard } from "@/components/ProfileCard";
import { PlanCard } from "@/components/PlanCard";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { MapaAstral } from "@/components/MapaAstral";
import { HoroscopoDia } from "@/components/HoroscopoDia";
import { RadarCoracao } from "@/components/RadarCoracao";
import { DiarioEstrelas } from "@/components/DiarioEstrelas";
import { BottomNav } from "@/components/BottomNav";
import { getZodiacSign, type ZodiacSign } from "@/lib/zodiac";
import type { User as UserType, ChatMessage as ChatMessageType, DailyAudio, PlanType, Partner, DiaryEntry } from "@shared/schema";

type TabType = "chat" | "horoscopo" | "mapa" | "radar" | "diario" | "profile" | "plans";

const planData = [
  {
    name: "Essência",
    planId: "essencia" as PlanType,
    price: "R$ 29,90",
    description: "Comece sua jornada astrológica",
    features: [
      "Áudio diário personalizado",
      "3 perguntas por dia no chat",
      "Horóscopo do dia",
      "Mapa astral básico",
    ],
  },
  {
    name: "Conexão",
    planId: "conexao" as PlanType,
    price: "R$ 39,90",
    description: "Para quem busca entender relacionamentos",
    features: [
      "Tudo do Plano Essência",
      "10 perguntas por dia",
      "Radar do Coração (compatibilidade)",
      "Áudios mais longos (até 3min)",
      "Análise semanal aprofundada",
    ],
    isPopular: true,
  },
  {
    name: "Plenitude",
    planId: "plenitude" as PlanType,
    price: "R$ 59,90",
    description: "A experiência completa de autoconhecimento",
    features: [
      "Tudo do Plano Conexão",
      "Perguntas ilimitadas",
      "Diário das Estrelas",
      "Relatório mensal em PDF",
      "Suporte prioritário",
    ],
  },
];

const planLimits: Record<PlanType, number> = {
  essencia: 3,
  conexao: 10,
  plenitude: 999,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [showAudioPopup, setShowAudioPopup] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userId = localStorage.getItem("userId");

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessageType[]>({
    queryKey: ["/api/users", userId, "messages"],
    enabled: !!userId,
  });

  const { data: todayAudio } = useQuery<DailyAudio | null>({
    queryKey: ["/api/users", userId, "audio/today"],
    enabled: !!userId,
  });

  const { data: questionCount = 0 } = useQuery<number>({
    queryKey: ["/api/users", userId, "questions/count"],
    enabled: !!userId,
  });

  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["/api/users", userId, "partners"],
    enabled: !!userId,
  });

  const { data: diaryEntries = [] } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/users", userId, "diary"],
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) {
      setLocation("/");
    }
  }, [userId, setLocation]);

  useEffect(() => {
    if (todayAudio && !todayAudio.listened) {
      setShowAudioPopup(true);
    }
  }, [todayAudio]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSendMessage = async (content: string) => {
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(`/api/users/${userId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

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
              queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "messages"] });
              queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "questions/count"] });
            }
            if (data.error) {
              throw new Error(data.error);
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
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const markAudioListened = useMutation({
    mutationFn: async () => {
      if (todayAudio) {
        const response = await fetch(`/api/audio/${todayAudio.id}/listened`, {
          method: "PATCH",
        });
        if (!response.ok) throw new Error("Failed to mark audio");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "audio/today"] });
    },
  });

  const handleAudioComplete = () => {
    markAudioListened.mutate();
    setShowAudioPopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setLocation("/");
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse" />
          <p className="text-muted-foreground" data-testid="text-loading">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const zodiacSign = user.sunSign as ZodiacSign || getZodiacSign(user.birthDate);
  const maxQuestions = planLimits[user.plan as PlanType];
  const remainingQuestions = Math.max(0, maxQuestions - questionCount);
  const userPlan = user.plan as PlanType;

  const navItems = [
    { icon: MessageSquare, label: "Chat", tab: "chat" as TabType },
    { icon: Sun, label: "Horóscopo", tab: "horoscopo" as TabType },
    { icon: Map, label: "Mapa Astral", tab: "mapa" as TabType },
    { icon: Heart, label: "Radar do Coração", tab: "radar" as TabType, premium: userPlan === "essencia" },
    { icon: BookOpen, label: "Diário", tab: "diario" as TabType, premium: userPlan !== "plenitude" },
    { icon: User, label: "Perfil", tab: "profile" as TabType },
    { icon: CreditCard, label: "Planos", tab: "plans" as TabType },
  ];

  const NavItem = ({
    icon: Icon,
    label,
    tab,
    onClick,
    premium,
  }: {
    icon: typeof MessageSquare;
    label: string;
    tab: TabType;
    onClick: () => void;
    premium?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${
        activeTab === tab
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          : "text-muted-foreground"
      }`}
      data-testid={`button-nav-${tab}`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium flex-1 text-left">{label}</span>
      {premium && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
          PRO
        </Badge>
      )}
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <ZodiacIcon sign={zodiacSign} size="md" />
          <div>
            <p className="font-medium" data-testid="text-sidebar-name">{user.fullName.split(" ")[0]}</p>
            <p className="text-sm text-muted-foreground" data-testid="text-sidebar-sign">{zodiacSign}</p>
          </div>
        </div>
        <Badge variant="secondary" className="mt-3 capitalize" data-testid="badge-user-plan">
          Plano {user.plan}
        </Badge>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-muted-foreground uppercase tracking-wide px-4 mb-2">Recursos</p>
        {navItems.slice(0, 5).map((item) => (
          <NavItem
            key={item.tab}
            icon={item.icon}
            label={item.label}
            tab={item.tab}
            onClick={() => handleTabChange(item.tab)}
            premium={item.premium}
          />
        ))}
        <div className="pt-4 mt-4 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-wide px-4 mb-2">Conta</p>
          {navItems.slice(5).map((item) => (
            <NavItem
              key={item.tab}
              icon={item.icon}
              label={item.label}
              tab={item.tab}
              onClick={() => handleTabChange(item.tab)}
            />
          ))}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="flex h-screen">
        <aside className="hidden md:flex w-64 border-r flex-col bg-card">
          <SidebarContent />
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-card md:hidden">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              <span className="font-medium" data-testid="text-header-title">AstroMeu</span>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </header>

          <main className="flex-1 overflow-hidden">
            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b bg-white dark:bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-medium" data-testid="text-chat-header-title">Chat Astrológico</h2>
                      <p className="text-sm text-muted-foreground" data-testid="text-chat-header-subtitle">
                        Converse com Luna, sua astróloga
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-3/4" />
                        <Skeleton className="h-16 w-2/3 ml-auto" />
                      </div>
                    ) : messages.length === 0 && !isStreaming ? (
                      <div className="flex flex-col items-center justify-center py-8" data-testid="container-empty-chat">
                        <p className="text-sm text-muted-foreground mb-6" data-testid="text-greeting-date">
                          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>

                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30" data-testid="icon-luna-avatar">
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>

                        <h3 className="text-xl font-medium mb-1" data-testid="text-empty-chat-title">
                          Bom dia, {user.fullName.split(" ")[0]}!
                        </h3>
                        <p className="text-muted-foreground text-sm mb-8" data-testid="text-empty-chat-subtitle">
                          As estrelas prepararam algo especial para você
                        </p>

                        <div className="w-full max-w-sm" data-testid="container-daily-audio">
                          <div className="rounded-[20px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-5 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40">
                            <div className="flex items-center gap-2 mb-4">
                              <Volume2 className="h-4 w-4 text-indigo-200" />
                              <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider" data-testid="text-audio-label">Áudio do Dia</span>
                            </div>

                            <p className="text-sm text-indigo-100 mb-5 leading-relaxed" data-testid="text-audio-description">
                              Sua mensagem personalizada das estrelas baseada no seu signo e momento atual.
                            </p>

                            <div className="flex items-center gap-3 mb-4">
                              <Button
                                size="icon"
                                className="rounded-full bg-white text-indigo-600 shrink-0"
                                aria-label="Reproduzir áudio do dia"
                                data-testid="button-audio-play"
                                onClick={() => {
                                  if (todayAudio) {
                                    setShowAudioPopup(true);
                                  } else {
                                    toast({
                                      title: "Áudio em preparação",
                                      description: "Seu áudio personalizado está sendo gerado pelas estrelas.",
                                    });
                                  }
                                }}
                              >
                                <Play className="h-5 w-5 ml-0.5" />
                              </Button>

                              <div className="flex-1">
                                <div className="flex items-end gap-[3px] h-8" data-testid="visual-audio-waveform">
                                  {[0.3, 0.5, 0.8, 0.6, 1, 0.7, 0.4, 0.9, 0.5, 0.7, 0.3, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.6, 0.3, 0.8, 0.5, 0.4, 0.7, 0.6, 0.9, 0.3, 0.5, 0.8, 0.4, 0.6].map((h, i) => (
                                    <div
                                      key={i}
                                      className="flex-1 rounded-full bg-white/30"
                                      style={{ height: `${h * 100}%` }}
                                    />
                                  ))}
                                </div>
                                <div className="flex justify-between mt-1.5">
                                  <span className="text-[11px] text-indigo-200" data-testid="text-audio-time-start">0:00</span>
                                  <span className="text-[11px] text-indigo-200" data-testid="text-audio-time-end">1:30</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-white/15">
                              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs text-indigo-200" data-testid="text-audio-attribution">Luna preparou esta mensagem para você</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 text-center">
                          <p className="text-muted-foreground text-sm max-w-xs mx-auto" data-testid="text-empty-chat-description">
                            Ou pergunte para Luna sobre seu mapa astral, relacionamentos ou carreira
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => (
                          <ChatMessage
                            key={msg.id}
                            role={msg.role as "user" | "assistant"}
                            content={msg.content}
                            timestamp={new Date(msg.createdAt)}
                          />
                        ))}
                        {isStreaming && streamingContent && (
                          <ChatMessage
                            role="assistant"
                            content={streamingContent}
                          />
                        )}
                        {isStreaming && !streamingContent && (
                          <ChatMessage
                            role="assistant"
                            content=""
                            isLoading
                          />
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-white dark:bg-card">
                  <div className="max-w-3xl mx-auto">
                    <ChatInput
                      onSend={handleSendMessage}
                      disabled={isStreaming}
                      remainingQuestions={remainingQuestions}
                      maxQuestions={maxQuestions}
                      placeholder="Pergunte sobre seu signo, trânsitos ou relacionamentos..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "horoscopo" && (
              <ScrollArea className="h-full">
                <div className="p-6 max-w-2xl mx-auto">
                  <HoroscopoDia zodiacSign={zodiacSign} userName={user.fullName} />
                </div>
              </ScrollArea>
            )}

            {activeTab === "mapa" && (
              <ScrollArea className="h-full">
                <div className="p-6 max-w-2xl mx-auto">
                  <MapaAstral
                    sunSign={zodiacSign}
                    moonSign={user.moonSign as ZodiacSign | null}
                    ascendantSign={user.ascendantSign as ZodiacSign | null}
                    birthDate={user.birthDate}
                    birthTime={user.birthTime}
                    birthCity={user.birthCity}
                  />
                </div>
              </ScrollArea>
            )}

            {activeTab === "radar" && (
              <ScrollArea className="h-full">
                <div className="p-6 max-w-2xl mx-auto">
                  <RadarCoracao
                    userPlan={userPlan}
                    partners={partners}
                    onAddPartner={(data) => {
                      toast({
                        title: "Em breve!",
                        description: "Funcionalidade de adicionar parceiro será ativada em breve.",
                      });
                    }}
                  />
                </div>
              </ScrollArea>
            )}

            {activeTab === "diario" && (
              <ScrollArea className="h-full">
                <div className="p-6 max-w-2xl mx-auto">
                  <DiarioEstrelas
                    userPlan={userPlan}
                    entries={diaryEntries}
                    entriesThisMonth={diaryEntries.filter(e => {
                      const entryDate = new Date(e.createdAt);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                    }).length}
                    onAddEntry={(content, mood) => {
                      toast({
                        title: "Em breve!",
                        description: "Funcionalidade do diário será ativada em breve.",
                      });
                    }}
                  />
                </div>
              </ScrollArea>
            )}

            {activeTab === "profile" && (
              <ScrollArea className="h-full">
                <div className="p-6 pb-24 md:pb-6 max-w-2xl mx-auto space-y-6">
                  <h2 className="text-xl font-medium" data-testid="text-profile-page-title">Meu Perfil</h2>
                  <ProfileCard
                    name={user.fullName}
                    zodiacSign={zodiacSign}
                    birthDate={user.birthDate}
                    plan={user.plan}
                  />

                  <Card data-testid="card-personal-info">
                    <CardHeader>
                      <CardTitle className="text-base">Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium" data-testid="text-user-email">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">WhatsApp</p>
                          <p className="font-medium" data-testid="text-user-whatsapp">{user.whatsapp}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cidade de nascimento</p>
                          <p className="font-medium" data-testid="text-user-birth-city">{user.birthCity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Preferência de voz</p>
                          <p className="font-medium" data-testid="text-user-voice-preference">{user.voicePreference === "feminine" ? "Feminina" : "Masculina"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center text-xs text-muted-foreground space-x-2 pt-4">
                    <a href="/terms" className="hover:text-indigo-500" data-testid="link-profile-terms">Termos de Uso</a>
                    <span>·</span>
                    <a href="/privacy" className="hover:text-indigo-500" data-testid="link-profile-privacy">Política de Privacidade</a>
                  </div>
                </div>
              </ScrollArea>
            )}

            {activeTab === "plans" && (
              <ScrollArea className="h-full">
                <div className="p-6 max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-medium mb-2" data-testid="text-plans-page-title">Escolha seu plano</h2>
                    <p className="text-muted-foreground" data-testid="text-plans-page-subtitle">
                      Desbloqueie todo o potencial da sua jornada astrológica
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {planData.map((plan) => (
                      <PlanCard
                        key={plan.planId}
                        name={plan.name}
                        price={plan.price}
                        description={plan.description}
                        features={plan.features}
                        isPopular={plan.isPopular}
                        isCurrent={user.plan === plan.planId}
                        onSelect={() => {
                          toast({
                            title: "Em breve!",
                            description: "Integração de pagamento será adicionada em breve.",
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}
          </main>
        </div>
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as TabType)}
        plan={userPlan}
      />

      {todayAudio && (
        <AudioPopup
          open={showAudioPopup}
          onOpenChange={setShowAudioPopup}
          userName={user.fullName}
          zodiacSign={zodiacSign}
          audioBase64={todayAudio.audioBase64 || undefined}
          audioUrl={todayAudio.audioUrl || undefined}
          transcript={todayAudio.transcript}
          onComplete={handleAudioComplete}
        />
      )}
    </div>
  );
}
