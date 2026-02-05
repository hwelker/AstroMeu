import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { Sparkles, X, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ZodiacSign } from "@/lib/zodiac";

interface AudioPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  zodiacSign: ZodiacSign;
  audioUrl?: string;
  audioBase64?: string;
  transcript?: string;
  onComplete?: () => void;
}

export function AudioPopup({
  open,
  onOpenChange,
  userName,
  zodiacSign,
  audioUrl,
  audioBase64,
  transcript,
  onComplete,
}: AudioPopupProps) {
  const firstName = userName.split(" ")[0];
  const hasAudio = audioUrl || audioBase64;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 bg-white dark:bg-card p-0 overflow-hidden" data-testid="dialog-audio-popup">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/80 to-transparent dark:from-indigo-900/30 h-32" />
          
          <DialogHeader className="relative pt-8 pb-4 px-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ZodiacIcon sign={zodiacSign} size="xl" />
                <div className="absolute -top-1 -right-1 bg-indigo-500 rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-medium" data-testid="text-audio-popup-title">
              Bom dia, {firstName}!
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm mt-1" data-testid="text-audio-popup-subtitle">
              Sua mensagem das estrelas está pronta
            </p>
          </DialogHeader>

          <div className="px-6 pb-6">
            {hasAudio ? (
              <AudioPlayer
                audioUrl={audioUrl}
                audioBase64={audioBase64}
                onComplete={onComplete}
              />
            ) : transcript ? (
              <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-6" data-testid="container-transcript">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium text-sm">Mensagem de hoje</span>
                </div>
                <ScrollArea className="max-h-48">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-transcript-content">
                    {transcript}
                  </p>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="container-no-audio">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-indigo-300" />
                <p className="text-sm">Sua mensagem está sendo preparada...</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  onComplete?.();
                  onOpenChange(false);
                }}
                data-testid="button-close-audio-popup"
              >
                <X className="h-4 w-4 mr-2" />
                {hasAudio ? "Ouvir depois" : "Fechar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
