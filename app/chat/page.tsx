"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Download, Send, User, Lock } from "lucide-react";

export default function ChatPage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useLang();
  const s = strings[lang];
  const [messages, setMessages] = useState<{role: "user"|"ai"; text: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [kundaliData, setKundaliData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sequential card steps
  const steps = [
    { id: "birth", title: "जन्म विवरण", description: "Birth Details", icon: "👶" },
    { id: "kundali", title: "कुण्डली विवरण", description: "Kundali Details", icon: "📊" },
    { id: "planets", title: "ग्रहस्थीति", description: "Planetary Positions", icon: "🪐" },
    { id: "navamsa", title: "नवमांस कुण्डली", description: "Navamsa Chart", icon: "🔮" },
    { id: "rashi", title: "राशी कुण्डली", description: "Rashi Chart", icon: "♈" },
    { id: "vimshottari", title: "विम्शोत्तरी दशा", description: "Vimshottari Dasha", icon: "⏰" },
    { id: "yogini", title: "योगिनी दशा", description: "Yogini Dasha", icon: "🌸" },
    { id: "transit", title: "गोचर ग्रहस्थीति", description: "Current Transits", icon: "🌙" },
    { id: "analysis", title: "विश्लेषण", description: "Analysis & Questions", icon: "🔍" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: "user" as const, text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response and progress to next step
    setTimeout(() => {
      const aiResponse = getAIResponse(currentStep, inputValue);
      setMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Final step - show analysis and questions
        setKundaliData(generateKundaliData());
      }
    }, 1000);
  };

  const getAIResponse = (step: number, userInput: string) => {
    const responses = [
      "Thank you for providing your birth details. Let me analyze your kundali...",
      "Based on your birth details, I can see your kundali chart. Let me show you the planetary positions...",
      "Here are your planetary positions. Now let me calculate your Navamsa chart...",
      "Your Navamsa chart is ready. Let me also show your Rashi chart...",
      "Your Rashi chart is complete. Now let me calculate your Vimshottari Dasha periods...",
      "Your Vimshottari Dasha periods are calculated. Let me also show your Yogini Dasha...",
      "Your Yogini Dasha is ready. Now let me check your current planetary transits...",
      "Your current transits are analyzed. Let me provide you with a comprehensive analysis...",
      "Your complete astrological analysis is ready! I can see several interesting patterns in your chart. What specific questions would you like to ask about your career, love life, health, or any other aspect?"
    ];
    return responses[step] || "Thank you for your input. Let me analyze this further...";
  };

  const generateKundaliData = () => ({
    ascendant: "Taurus",
    moon: "Capricorn",
    sun: "Sagittarius",
    planets: [
      { name: "Sun", sign: "Sagittarius", house: 8, degree: 15.23 },
      { name: "Moon", sign: "Capricorn", house: 9, degree: 10.45 },
      { name: "Mars", sign: "Sagittarius", house: 8, degree: 2.10 },
      { name: "Mercury", sign: "Capricorn", house: 9, degree: 25.30 },
      { name: "Jupiter", sign: "Aries", house: 12, degree: 5.0 },
      { name: "Venus", sign: "Aquarius", house: 11, degree: 18.15 },
      { name: "Saturn", sign: "Aquarius", house: 10, degree: 28.99 }
    ],
    dasha: {
      current: "Ketu",
      period: "2020-2027",
      next: "Venus"
    }
  });

  // Check session on mount
  useEffect(() => {
    // Simulate session check - in real app, this would check actual auth
    const checkSession = async () => {
      try {
        const response = await fetch('/api/me');
        if (response.ok) {
          const userData = await response.json();
          setSession(userData);
        }
      } catch (error) {
        console.log('No session found');
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  // Show login if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ZSTRO AI</h1>
            <p className="text-gray-600">AI Jyotish services from Nepal</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-gray-500">
              Please sign in to access your personalized astrological consultation
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/login'}>
              <User className="w-4 h-4 mr-2" />
              Sign In / Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">ZSTRO AI</h1>
              <p className="text-xs text-gray-500">AI Jyotish services from Nepal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Sequential Cards */}
        <div className="space-y-4 mb-6">
          {steps.slice(0, currentStep + 1).map((step, index) => (
            <Card key={step.id} className={`transition-all duration-500 ${
              index === currentStep 
                ? 'bg-gradient-to-r from-indigo-100 via-sky-100 to-pink-100 border-indigo-300 shadow-lg' 
                : 'bg-white/70 border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{step.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {index < currentStep && (
                    <div className="ml-auto">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Welcome Message */}
        {currentStep === 0 && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ZSTRO AI!</h2>
            <p className="text-gray-600">ZSTRO AI is the AI Jyotish services from Nepal.</p>
            <p className="text-sm text-gray-500 mt-2">Please provide your birth details to begin your astrological consultation.</p>
          </div>
        )}

        {/* Final Analysis Card */}
        {currentStep === steps.length - 1 && kundaliData && (
          <Card className="bg-gradient-to-r from-emerald-100 via-green-100 to-lime-100 border-emerald-300 shadow-lg mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4">Your Complete Astrological Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-emerald-700 mb-2">Birth Summary</h4>
                  <p className="text-sm text-emerald-600">Ascendant: {kundaliData.ascendant} | Moon: {kundaliData.moon}</p>
                </div>
                <div>
                  <h4 className="font-medium text-emerald-700 mb-2">Current Dasha</h4>
                  <p className="text-sm text-emerald-600">{kundaliData.dasha.current} ({kundaliData.dasha.period})</p>
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <h4 className="font-medium text-emerald-700 mb-2">Suggested Questions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="bg-white/80 rounded p-2">What does my career future hold?</div>
                  <div className="bg-white/80 rounded p-2">When will I get married?</div>
                  <div className="bg-white/80 rounded p-2">What are my health predictions?</div>
                </div>
                <p className="text-xs text-emerald-600 mt-2">You can ask any other questions that come to mind!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white/80 text-gray-800 border border-gray-200'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="sticky bottom-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-2 shadow-lg">
            <Button type="button" variant="ghost" size="sm">
              <Upload className="w-4 h-4" />
            </Button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={s.chat_ph || "Send a message..."}
              className="flex-1 border-0 bg-transparent focus:ring-0"
            />
            <Button type="submit" disabled={!inputValue.trim()} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}