import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  remainingQuestions?: number;
  maxQuestions?: number;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Digite sua pergunta...",
  remainingQuestions,
  maxQuestions,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isAtLimit = remainingQuestions !== undefined && remainingQuestions <= 0;

  return (
    <form onSubmit={handleSubmit} className="relative" data-testid="form-chat-input">
      {remainingQuestions !== undefined && maxQuestions !== undefined && (
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-xs text-muted-foreground" data-testid="text-questions-remaining">
            {isAtLimit ? (
              <span className="text-destructive">Limite de perguntas atingido</span>
            ) : (
              <>
                <span className="font-medium text-indigo-500">{remainingQuestions}</span>
                {" "}de {maxQuestions} perguntas restantes hoje
              </>
            )}
          </span>
        </div>
      )}
      
      <div className="relative flex items-end gap-2 rounded-2xl border bg-background p-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAtLimit ? "Aguarde até amanhã para novas perguntas" : placeholder}
          disabled={disabled || isAtLimit}
          className="min-h-[44px] max-h-[120px] resize-none border-0 focus-visible:ring-0 text-sm"
          rows={1}
          data-testid="input-chat-message"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled || isAtLimit}
          className="shrink-0 rounded-xl"
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
