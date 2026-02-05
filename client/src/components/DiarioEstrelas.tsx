import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Mic, Send, Lock, Sparkles, TrendingUp, Calendar, Search, Filter, Heart, Frown, Smile, Meh, Angry, HelpCircle } from "lucide-react";
import type { DiaryEntry, PlanType } from "@shared/schema";

interface DiarioEstrelasProps {
  userPlan: PlanType;
  entries: DiaryEntry[];
  entriesThisMonth: number;
  onAddEntry?: (content: string, mood: string) => void;
}

const moodOptions = [
  { value: "feliz", label: "Feliz", icon: Smile, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "triste", label: "Triste", icon: Frown, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "ansiosa", label: "Ansiosa", icon: HelpCircle, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "confusa", label: "Confusa", icon: Meh, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "com_raiva", label: "Com raiva", icon: Angry, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { value: "apaixonada", label: "Apaixonada", icon: Heart, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
];

const mockEntries: DiaryEntry[] = [
  {
    id: "1",
    userId: "1",
    content: "Hoje me senti muito insegura sobre meu relacionamento. Não sei se estou fazendo as escolhas certas...",
    mood: "ansiosa",
    aiResponse: "Querida, é completamente natural sentir insegurança em momentos de transição. Com seu Sol em Áries e a Lua transitando por Câncer hoje, suas emoções estão mais sensíveis do que o normal. Lembre-se que duvidar não significa que você está errada - significa que você está refletindo profundamente sobre o que importa para você. O que especificamente despertou essa sensação hoje?",
    patternDetected: "Insegurança mencionada em 3 dos últimos 5 diários, especialmente durante trânsitos lunares em signos de água.",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    userId: "1",
    content: "Tivemos uma conversa incrível ontem! Me sinto mais conectada com ele.",
    mood: "feliz",
    aiResponse: "Que maravilhoso! Vênus está em aspecto harmonioso com seu mapa natal, favorecendo momentos de conexão genuína. Quando você se permite vulnerabilidade, cria espaço para intimidade verdadeira. Continue cultivando esses momentos de abertura. O que você acha que tornou essa conversa tão especial?",
    patternDetected: null,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export function DiarioEstrelas({ userPlan, entries, entriesThisMonth, onAddEntry }: DiarioEstrelasProps) {
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [entryContent, setEntryContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [viewEntry, setViewEntry] = useState<DiaryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string | null>(null);

  const isLocked = userPlan !== "plenitude";
  const maxEntriesPerMonth = 10;
  const remainingEntries = maxEntriesPerMonth - entriesThisMonth;
  const displayEntries = entries.length > 0 ? entries : mockEntries;

  const handleSubmitEntry = () => {
    if (onAddEntry && entryContent && selectedMood) {
      onAddEntry(entryContent, selectedMood);
      setEntryContent("");
      setSelectedMood(null);
      setNewEntryOpen(false);
    }
  };

  const filteredEntries = displayEntries.filter((entry) => {
    const matchesSearch = !searchQuery || entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = !filterMood || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  if (isLocked) {
    return (
      <Card className="border shadow-sm" data-testid="card-diario-locked">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="font-medium text-lg mb-2">Diário das Estrelas</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Desbloqueie seu espaço pessoal para desabafar com análise astrológica profunda, detecção de padrões emocionais e insights personalizados.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary">10 entradas por mês</Badge>
              <Badge variant="secondary">Análise por IA</Badge>
              <Badge variant="secondary">Padrões emocionais</Badge>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              Exclusivo do Plano Plenitude
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium" data-testid="text-diario-title">Diário das Estrelas</h2>
          <p className="text-sm text-muted-foreground">
            Seu espaço seguro para reflexões com insights astrológicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" data-testid="badge-remaining-entries">
            {remainingEntries} entradas restantes
          </Badge>

          <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
            <DialogTrigger asChild>
              <Button disabled={remainingEntries <= 0} data-testid="button-new-entry">
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova entrada no diário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <p className="text-sm font-medium mb-3">Como você está se sentindo?</p>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map((mood) => (
                      <Button
                        key={mood.value}
                        variant="outline"
                        size="sm"
                        className={`toggle-elevate ${selectedMood === mood.value ? "toggle-elevated border-indigo-500" : ""}`}
                        onClick={() => setSelectedMood(mood.value)}
                        data-testid={`button-mood-${mood.value}`}
                      >
                        <mood.icon className="h-4 w-4 mr-1" />
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">O que você quer compartilhar?</p>
                  <Textarea
                    placeholder="Escreva o que está sentindo, o que aconteceu hoje, seus pensamentos..."
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    className="min-h-[150px]"
                    maxLength={1000}
                    data-testid="textarea-entry-content"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {entryContent.length}/1000 caracteres
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled
                    data-testid="button-record-audio"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Gravar áudio
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmitEntry}
                    disabled={!entryContent || !selectedMood}
                    data-testid="button-submit-entry"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por palavra-chave..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-entries"
          />
        </div>
        <Button
          variant="outline"
          className={filterMood ? "border-indigo-500" : ""}
          onClick={() => setFilterMood(filterMood ? null : "ansiosa")}
          data-testid="button-filter-mood"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      <Card className="border shadow-sm" data-testid="card-pattern-alert">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm mb-1">Padrão detectado</p>
              <p className="text-sm text-muted-foreground" data-testid="text-pattern-detected">
                Você tem mencionado "insegurança" em 3 dos últimos 5 diários, especialmente durante trânsitos lunares em signos de água. Isso pode indicar uma sensibilidade emocional maior nestes períodos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Suas entradas
        </h3>

        {filteredEntries.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma entrada encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {filteredEntries.map((entry) => {
                const moodOption = moodOptions.find((m) => m.value === entry.mood);
                const MoodIcon = moodOption?.icon || Meh;
                const entryDate = new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <Card
                    key={entry.id}
                    className="border shadow-sm cursor-pointer hover-elevate"
                    onClick={() => setViewEntry(entry)}
                    data-testid={`entry-${entry.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={moodOption?.color} variant="secondary">
                              <MoodIcon className="h-3 w-3 mr-1" />
                              {moodOption?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{entryDate}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.content}
                          </p>
                          {entry.patternDetected && (
                            <Badge variant="outline" className="mt-2">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Padrão detectado
                            </Badge>
                          )}
                        </div>
                        {entry.aiResponse && (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {viewEntry && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className={moodOptions.find((m) => m.value === viewEntry.mood)?.color}>
                    {moodOptions.find((m) => m.value === viewEntry.mood)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(viewEntry.createdAt).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <p className="text-sm font-medium mb-2">Sua entrada:</p>
                  <p className="text-muted-foreground" data-testid="text-entry-content">
                    {viewEntry.content}
                  </p>
                </div>

                {viewEntry.aiResponse && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Resposta da Luna</p>
                        <p className="text-sm text-muted-foreground" data-testid="text-ai-response">
                          {viewEntry.aiResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewEntry.patternDetected && (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">Padrão detectado</p>
                        <p className="text-sm text-muted-foreground" data-testid="text-pattern-detail">
                          {viewEntry.patternDetected}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
