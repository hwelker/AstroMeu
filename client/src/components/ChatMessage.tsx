import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, timestamp, isLoading }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`chat-message-${role}`}
    >
      <Avatar className={cn(
        "h-9 w-9 shrink-0",
        isUser 
          ? "bg-indigo-100 dark:bg-indigo-900/30" 
          : "bg-gradient-to-br from-indigo-500 to-purple-500"
      )}>
        <AvatarFallback className={cn(
          isUser 
            ? "text-indigo-600 dark:text-indigo-400" 
            : "text-white"
        )}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-indigo-500 text-white rounded-br-md"
              : "bg-muted dark:bg-muted/50 text-foreground rounded-bl-md"
          )}
          data-testid={`text-chat-content-${role}`}
        >
          {isLoading ? (
            <div className="flex gap-1" data-testid="chat-loading-indicator">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1" data-testid={`text-chat-timestamp-${role}`}>
            {timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
