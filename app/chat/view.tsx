"use client";
import { useState, useRef, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import FileCards from "@/components/FileCards";
import ResultSummaryCard from "@/components/astro/ResultSummaryCard";
import PlanetTableCard from "@/components/astro/PlanetTableCard";
import YogDoshGrid from "@/components/astro/YogDoshGrid";
import PDFButtonCard from "@/components/astro/PDFButtonCard";
import ShadbalaCard from "@/components/astro/ShadbalaCard";
import AshtakavargaCard from "@/components/astro/AshtakavargaCard";
import DashaTreeCard from "@/components/astro/DashaTreeCard";
import VargaTiles from "@/components/astro/VargaTiles";
import ConditionWatchCard from "@/components/astro/ConditionWatchCard";
import TransitTodayCard from "@/components/astro/TransitTodayCard";
import PanchangaCard from "@/components/astro/PanchangaCard";
import LangSwitcher from "@/components/LangSwitcher";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Sparkles, Globe } from "lucide-react";

type Item = { url:string; type:string; name:string; text?:string; meta?:any };
type Message = { id: string; text: string; timestamp: Date; isUser: boolean };

export default function ClientChatView() {
  const [items, setItems] = useState<Item[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const append = (t:string) => {
    setInputValue(prev => `${prev}\n\n[FILE SNIPPET]\n${t}`);
    inputRef.current?.focus();
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${userMessage.text}". Based on your astrological chart, I can see several interesting patterns. Let me analyze the planetary positions and provide you with detailed insights.`,
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const data = {
    ascSignLabel: "वृष",
    moonSignLabel: "मकर",
    planets: [
      { 
        planet:"Sun", 
        signLabel:"धनु", 
        house:8, 
        degree:null,
        combust: false,
        retro: false,
        shadbala: { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65, drik: 0 }
      },
      { 
        planet:"Mars",
        signLabel:"धनु", 
        house:8, 
        degree:null,
        combust: false,
        retro: true,
        shadbala: { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45, drik: 0 }
      },
      { 
        planet:"Saturn",
        signLabel:"कुम्भ", 
        house:10, 
        degree:null,
        combust: true,
        retro: false,
        shadbala: { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3, drik: 0 }
      },
    ],
    shadbala: {
      "Sun": { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65, drik: 0 },
      "Mars": { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45, drik: 0 },
      "Saturn": { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3, drik: 0 }
    },
    ashtakavarga: {
      sav: [
        { house: 1, points: 6 },
        { house: 2, points: 4 },
        { house: 3, points: 5 },
        { house: 4, points: 7 },
        { house: 5, points: 3 },
        { house: 6, points: 4 },
        { house: 7, points: 6 },
        { house: 8, points: 2 },
        { house: 9, points: 5 },
        { house: 10, points: 8 },
        { house: 11, points: 4 },
        { house: 12, points: 3 }
      ],
      bav: [
        { planet: "Sun", house: 1, points: 5 },
        { planet: "Moon", house: 2, points: 4 },
        { planet: "Mars", house: 3, points: 6 }
      ]
    },
    dasha: {
      vimshottari: [
        {
          name: "Ketu",
          lord: "Ketu",
          start: "2020-01-01T00:00:00Z",
          end: "2027-01-01T00:00:00Z",
          level: "MAHA",
          children: [
            {
              name: "Venus",
              lord: "Venus",
              start: "2023-01-01T00:00:00Z",
              end: "2024-01-01T00:00:00Z",
              level: "ANTAR"
            }
          ]
        }
      ],
      yogini: null
    },
    vargas: [
      { id: "D9", title: "Navamsa", keyHints: ["Marriage", "Spiritual growth"], verdict: "Strong 9th house" },
      { id: "D10", title: "Dasamsa", keyHints: ["Career", "Profession"], verdict: "Good career prospects" }
    ],
    transits: [
      { date: "2024-01-20", highlights: ["Jupiter enters Aries", "Mars aspects 7th house"] },
      { date: "2024-02-15", highlights: ["Saturn direct motion", "Venus conjunct Sun"] }
    ],
    panchanga: {
      tithi: "Purnima",
      vara: "Sunday",
      nakshatra: "Rohini",
      yoga: "Siddhi",
      karana: "Vishti"
    },
    yogas: [{label:"गजकेसरी", factors:["Jupiter","Moon"]}],
    doshas: [{label:"मंगल दोष", factors:["Mars"]}],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50">
      {/* Floating Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-2">
          <LangSwitcher />
        </div>
      </div>

      {/* Scrollable Cards Section */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 pb-32">
        <ErrorBoundary>
          {/* Upload Section */}
          <div className="space-y-4">
            <UploadBox onUploaded={(it)=>setItems(prev=>[it, ...prev])} />
            <FileCards items={items} onSendToChat={append} />
          </div>

          {/* Summary Card */}
          <div className="border-2 border-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 bg-clip-padding rounded-2xl p-1">
            <ResultSummaryCard asc={data.ascSignLabel} moon={data.moonSignLabel} />
          </div>

          {/* Strength Analysis */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {getString("strength", lang)} Analysis
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-transparent bg-gradient-to-r from-emerald-200 via-green-200 to-lime-200 bg-clip-padding rounded-2xl p-1">
                <ShadbalaCard data={data.shadbala} />
              </div>
              <div className="border-2 border-transparent bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 bg-clip-padding rounded-2xl p-1">
                <AshtakavargaCard data={data.ashtakavarga} />
              </div>
            </div>
          </div>

          {/* Dasha System */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {getString("dasha_v", lang)} System
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-transparent bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-padding rounded-2xl p-1">
                <DashaTreeCard title={getString("dasha_v", lang)} tree={data.dasha.vimshottari} />
              </div>
              {data.dasha.yogini && (
                <div className="border-2 border-transparent bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 bg-clip-padding rounded-2xl p-1">
                  <DashaTreeCard title={getString("dasha_y", lang)} tree={data.dasha.yogini} />
                </div>
              )}
            </div>
          </div>

          {/* Divisional Charts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {getString("varga", lang)} Charts
            </h2>
            <div className="border-2 border-transparent bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-padding rounded-2xl p-1">
              <VargaTiles items={data.vargas} />
            </div>
          </div>

          {/* Planetary Conditions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Planetary Conditions
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-transparent bg-gradient-to-r from-rose-200 via-red-200 to-pink-200 bg-clip-padding rounded-2xl p-1">
                <ConditionWatchCard planets={data.planets} />
              </div>
              <div className="border-2 border-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-padding rounded-2xl p-1">
                <PlanetTableCard rows={data.planets}/>
              </div>
            </div>
          </div>

          {/* Transits & Panchanga */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {getString("transit", lang)} & {getString("panchanga", lang)}
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-transparent bg-gradient-to-r from-teal-200 via-emerald-200 to-lime-200 bg-clip-padding rounded-2xl p-1">
                <TransitTodayCard transits={data.transits} />
              </div>
              <div className="border-2 border-transparent bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-padding rounded-2xl p-1">
                <PanchangaCard panchanga={data.panchanga} />
              </div>
            </div>
          </div>

          {/* Yogas & Doshas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {getString("yogas_title", lang)} & {getString("doshas_title", lang)}
            </h2>
            <div className="border-2 border-transparent bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 bg-clip-padding rounded-2xl p-1">
              <YogDoshGrid yogas={data.yogas} doshas={data.doshas} />
            </div>
          </div>

          {/* PDF Export */}
          <div className="border-2 border-transparent bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-200 bg-clip-padding rounded-2xl p-1">
            <PDFButtonCard onClick={()=>alert("PDF generation coming soon!")} />
          </div>
        </ErrorBoundary>
      </div>

      {/* Sticky Chat Box */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-inner">
        {/* Chat Summary Preview */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-200/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>Latest: {messages[messages.length - 1]?.text.substring(0, 50)}...</span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        {messages.length > 0 && (
          <div className="max-h-48 overflow-y-auto px-4 py-2 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                    message.isUser
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-xl text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={sendMessage} className="flex items-center gap-2 p-3">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getString("composer", lang)}
            className="flex-1 rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="rounded-xl bg-indigo-500 text-white px-4 py-3 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
