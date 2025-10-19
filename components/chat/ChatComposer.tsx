"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface ChatComposerProps {
  disabled?: boolean;
  onSend: (message: string) => void;
}

export default function ChatComposer({ disabled = false, onSend }: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();
  const s = strings[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        className="p-2"
        disabled={disabled}
      >
        <Paperclip className="w-4 h-4" />
      </Button>
      
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? s.read_cards_to_continue : s.composer}
        disabled={disabled}
        className={`flex-1 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        size="sm" 
        className="p-2"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
