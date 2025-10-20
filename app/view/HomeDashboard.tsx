"use client";
import { useEffect, useRef, useState } from "react";
import { getAstroPayload } from "@/app/chat/actions";
import { AstroPayload } from "@/lib/astro-contract";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import LangSwitcher from "@/components/LangSwitcher";
import UploadBox from "@/components/UploadBox";
import SaveMenu from "@/components/SaveMenu";
import BirthCard from "@/components/cards/BirthCard";
import OverviewCard from "@/components/cards/OverviewCard";
import PlanetsCard from "@/components/cards/PlanetsCard";
import ChartsCard from "@/components/cards/ChartsCard";
import DashaCard from "@/components/cards/DashaCard";
import YoginiCard from "@/components/cards/YoginiCard";
import TransitsCard from "@/components/cards/TransitsCard";
import AnalysisCard from "@/components/cards/AnalysisCard";
import SuggestCard from "@/components/cards/SuggestCard";
import ChatComposer from "@/components/chat/ChatComposer";

interface HomeDashboardProps {
  user: any;
}

export default function HomeDashboard({ user }: HomeDashboardProps) {
  const [payload, setPayload] = useState<AstroPayload | null>(null);
  const [stage, setStage] = useState<"loading" | "cards" | "ready">("loading");
  const [messages, setMessages] = useState<{role: "user"|"ai"; text: string}[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{name: string; type: string}[]>([]);
  const unlockRef = useRef<HTMLDivElement | null>(null);
  const { lang } = useLang();
  const s = strings[lang];

  useEffect(() => {
    (async () => {
      try {
        const data = await getAstroPayload("me");
        setPayload(data);
        setStage("cards");
      } catch (error) {
        console.error("Error loading astro data:", error);
        setStage("cards"); // Still show cards even if data fails
      }
    })();
  }, []);

  useEffect(() => {
    if (stage !== "cards" || !unlockRef.current) return;
    
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setStage("ready");
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    
    io.observe(unlockRef.current);
    return () => io.disconnect();
  }, [stage]);

  const handleUploaded = (file: {name: string; type: string}) => {
    setAttachedFiles(prev => [...prev, file]);
  };

  const sendMsg = (msg: string) => {
    setMessages(m => [...m, { role: "user", text: msg }]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = `Thank you for your question: "${msg}". Based on your birth chart, I can provide detailed insights about this topic.`;
      setMessages(m => [...m, { role: "ai", text: aiResponse }]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMsg(suggestion);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">
            👋 Welcome, {user?.name || user?.email || "User"}
          </div>
          <div className="flex items-center gap-2">
            <SaveMenu targetSelector="main" />
            <LangSwitcher />
          </div>
        </div>
      </header>

      {/* Main Cards */}
      <main className="flex-1 overflow-y-auto px-4 py-5 mx-auto w-full max-w-3xl space-y-5">
        <UploadBox onUploaded={handleUploaded} />

        {!payload ? (
          <div className="rounded-2xl h-48 bg-gradient-to-r from-indigo-100 to-sky-100 animate-pulse" />
        ) : (
          <>
            <BirthCard data={payload.birth} />
            <OverviewCard data={payload.overview} />
            <PlanetsCard rows={payload.planets} />
            <ChartsCard charts={payload.charts} />
            <DashaCard title="Vimshottari Dasha" tree={payload.vimshottari} />
            <YoginiCard title="Yogini Dasha" tree={payload.yogini} />
            <TransitsCard data={payload.transits} />
            <AnalysisCard text={payload.analysis} />
            <SuggestCard items={payload.suggestions} onSuggestionClick={handleSuggestionClick} />
            <div ref={unlockRef} /> {/* when visible -> enable chat */}
          </>
        )}

        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">{s.attached_files}:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {attachedFiles.map((file, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {file.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-gray-800">{s.chat_history}</h3>
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
          </div>
        )}
      </main>

      {/* Sticky Chat */}
      <div className="sticky bottom-0 z-10 bg-white/85 backdrop-blur-md border-t">
        <div className="mx-auto max-w-3xl w-full flex items-center justify-between px-4 py-2">
          <div className="text-xs opacity-70">
            {stage === "ready" ? s.chat_enabled : s.read_cards_to_continue}
          </div>
        </div>
        <ChatComposer 
          disabled={stage !== "ready"} 
          onSend={sendMsg}
        />
      </div>
    </div>
  );
}
