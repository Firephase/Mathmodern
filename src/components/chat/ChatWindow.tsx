"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LatexRenderer } from "@/components/math/LatexRenderer";
import { cn, getInitials } from "@/lib/utils";
import { Send, Hash } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isLatex: boolean;
  createdAt: Date | string;
  sender: { id: string; name: string; avatar?: string | null };
}

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export function ChatWindow({ chatId, initialMessages, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [isLatex, setIsLatex] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  const send = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, content: content.trim(), isLatex }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setContent("");
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarImage src={msg.sender.avatar ?? undefined} />
                <AvatarFallback className="text-[10px]">{getInitials(msg.sender.name)}</AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[70%]", isMe && "items-end")}>
                <p className={cn("text-xs text-muted-foreground mb-1", isMe && "text-right")}>
                  {msg.sender.name}
                </p>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                )}>
                  {msg.isLatex ? (
                    <LatexRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLatex ? "Введи LaTeX формулы..." : "Напиши сообщение... (Enter — отправить)"}
              className={cn("pr-10 resize-none", isLatex && "font-mono")}
              rows={2}
            />
            <button
              onClick={() => setIsLatex(v => !v)}
              className={cn(
                "absolute right-2 bottom-2 p-1 rounded transition-colors",
                isLatex ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title="Переключить LaTeX режим"
            >
              <Hash className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={send} disabled={sending || !content.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isLatex && (
          <p className="text-xs text-primary mt-1">LaTeX режим — формулы будут отрендерены</p>
        )}
      </div>
    </>
  );
}
