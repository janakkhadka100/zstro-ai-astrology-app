"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Square, Paperclip, Send, User } from "lucide-react";

export default function ChatPage() {
  const { lang } = useLang();
  const s = strings[lang];
  const [messages, setMessages] = useState<{role: "user"|"ai"; text: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: "user" as const, text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    // Add to conversations if it's the first message
    if (messages.length === 0) {
      setConversations(prev => [...prev, inputValue.substring(0, 30) + "..."]);
    }
    
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(inputValue);
      setMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    }, 1000);
  };

  const getAIResponse = (userInput: string) => {
    const responses = [
      "Thank you for your question! Let me analyze your astrological chart and provide you with detailed insights.",
      "Based on your birth details, I can see several interesting planetary positions that will influence your life.",
      "Your kundali shows strong potential in career and relationships. Let me explain the key factors.",
      "I notice some important yogas in your chart that indicate prosperity and success in the coming years.",
      "Your current planetary transits suggest this is an excellent time for new beginnings and opportunities."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const suggestionCards = [
    {
      title: "What does your birth chart reveal?",
      description: "Get your personalized horoscope based on your birth details.",
      icon: "🔮"
    },
    {
      title: "How will your day be?",
      description: "Read your daily horoscope for insights and guidance.",
      icon: "📅"
    },
    {
      title: "What does the future hold for you?",
      description: "Discover predictions on career, love, health, and finance.",
      icon: "🔮"
    },
    {
      title: "Need astrological solutions?",
      description: "Consult experts for remedies to your problems.",
      icon: "💡"
    }
  ];

  return (
    <div className="h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">ZSTRO AI</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 p-4">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center mt-8">
              Your conversations will appear here once you start chatting!
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv, index) => (
                <div key={index} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <p className="text-sm text-gray-700 truncate">{conv}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Account */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">j@kc.com</span>
            <Button variant="ghost" size="sm" className="p-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ZSTRO AI!</h2>
              <p className="text-gray-600">ZSTRO AI is the AI Jyotish services from Nepal.</p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
              {suggestionCards.map((card, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{card.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
                        <p className="text-sm text-gray-600">{card.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="p-2">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!inputValue.trim()} size="sm" className="p-2">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}