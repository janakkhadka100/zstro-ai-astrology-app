"use client";

import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  CalendarDays,
  MessageSquareText,
  Compass,
  Stars,
  Brain,
  Heart,
  ShieldCheck,
  UserCircle2,
  LogIn,
  LogOut,
  Loader2,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { initializeZstroNetwork } from "@/lib/zstro";
// Note: These imports are used in server-side functions only
// import { auth } from "@/app/(auth)/auth";
// import { getUserById } from "@/lib/db/queries";
// import { getAstroDataByUserIdAndType } from "@/lib/db/queries";

/**
 * ZSTRO AI Home Page (Single-file, drop-in)
 * - Minimal dependencies: Tailwind + shadcn/ui + lucide-react + framer-motion
 * - Features:
 *   1) Hero welcome section (as shown in screenshot)
 *   2) CTA tiles (What does your birth chart reveal? ...)
 *   3) If user is signed in and has birth details → Personalized Astro Cards
 *   4) Docked chat panel at bottom with message history
 *   5) Clean, modern styling with soft shadows and rounded corners
 *
 * Integration notes:
 * - Plug your auth in `useAuth()`; return user/profile or null.
 * - Plug your astro summary API in `fetchAstroSummary()`.
 * - Place this as `app/page.tsx` (Next.js App Router) or any route component.
 */

// ---- Types --------------------------------------------------------
interface AstroSummary {
  ascendant: { name: string; num: number } | null;
  moon: { sign: string; house?: number } | null;
  currentDasha?: {
    system: "Vimshottari" | "Yogini";
    maha: string;
    antara?: string;
    pratyantara?: string;
  } | null;
  transitHighlights?: string[];
  todayTips?: { title: string; items: string[] }[];
}

// ---- Hooks (simplified for demo) ------------------------
function useAuth() {
  const [user, setUser] = useState<{ name: string; email: string; photo?: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate auth check - replace with real auth
    const checkAuth = async () => {
      try {
        // For demo purposes, simulate a user immediately
        setUser({
          id: "demo-user-123",
          name: "Demo User",
          email: "demo@example.com",
          photo: undefined
        });
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return {
    user,
    loading,
    signIn: () => window.location.href = "/login",
    signOut: () => window.location.href = "/api/auth/signout",
  };
}

async function fetchAstroSummary(userId: string): Promise<AstroSummary> {
  try {
    // Call real API endpoint
    const response = await fetch(`/api/astro-summary?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch astro summary:", error);
    
    // Return fallback data if API fails
    return {
      ascendant: { name: "वृष (Taurus)", num: 2 },
      moon: { sign: "मकर (Capricorn)", house: 9 },
      currentDasha: { 
        system: "Vimshottari", 
        maha: "शुक्र", 
        antara: "बुध", 
        pratyantara: "शुक्र" 
      },
      transitHighlights: [
        "चन्द्र 9औँ भाव: भाग्य/धर्ममा फोकस",
        "शनि 10औँ: करियर स्थिरता",
        "बुध गोचर: संचार/डिलमा अवसर",
      ],
      todayTips: [
        { title: "Lucky", items: ["रङ: हल्का निलो", "संख्या: 3, 6"] },
        { title: "Focus", items: ["कागजात क्लियर", "ईमेल उत्तर", "मुलाकात तय"] },
      ],
    };
  }
}

// ---- UI components --------------------------------------------------------
const Container: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-white text-gray-900">
    <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8">{children}</div>
  </div>
);

const TopBar: React.FC<{
  user: { name: string; email: string; photo?: string; id: string } | null;
  onSignIn: () => void;
  onSignOut: () => void;
}> = ({ user, onSignIn, onSignOut }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-black text-white grid place-items-center font-semibold shadow-sm">Z</div>
        <div>
          <div className="text-xl font-semibold tracking-tight">ZSTRO AI</div>
          <div className="text-xs text-gray-500">AI Jyotish Services from Nepal</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Date Details Calendar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div className="text-sm">
            <div className="font-medium text-blue-800">
              {new Date().toLocaleDateString('ne-NP', { 
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-blue-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photo ?? ""} alt={user.name} />
              <AvatarFallback>{user.name?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <Button variant="secondary" className="rounded-xl" onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <Button className="rounded-xl" onClick={onSignIn}>
            <LogIn className="mr-2 h-4 w-4" /> Sign in
          </Button>
        )}
      </div>
    </div>
  );
};

const Hero: React.FC = () => (
  <div className="text-center py-14">
    <motion.h1
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-2xl md:text-3xl font-semibold"
    >
      Welcome to ZSTRO AI !
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mt-2 text-gray-600"
    >
      ZSTRO AI is the AI Jyotish services from Nepal.
    </motion.p>
  </div>
);

const CtaGrid: React.FC = () => {
  const items = [
    { title: "What does your birth chart reveal?", desc: "Get your personalized horoscope based on your birth details.", icon: Stars },
    { title: "How will your day be?", desc: "Read your daily horoscope for insights and guidance.", icon: CalendarDays },
    { title: "What does the future hold for you?", desc: "Discover predictions on career, love, health, and finance.", icon: Compass },
    { title: "Need astrological solutions?", desc: "Consult experts for remedies to your problems.", icon: ShieldCheck },
  ];
              return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((it, idx) => (
        <Card key={idx} className="rounded-2xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start gap-3">
            <div className="p-2 rounded-xl bg-gray-50"><it.icon className="h-5 w-5" /></div>
            <div>
              <CardTitle className="text-base md:text-lg">{it.title}</CardTitle>
              <CardDescription className="text-sm text-gray-600">{it.desc}</CardDescription>
                    </div>
                  </CardHeader>
        </Card>
      ))}
    </div>
  );
};

const AstroCards: React.FC<{ data: AstroSummary | null; loading: boolean }>
= ({ data, loading }) => {
  if (loading) {
    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-3 w-40 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
        ))}
      </div>
    );
  }
  if (!data) return null;

  const tips = data.todayTips ?? [];

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Your Astro Snapshot</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Ascendant (लग्न)</CardTitle>
            <CardDescription>Your rising sign</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-semibold">{data.ascendant?.name ?? "—"}</div>
            <div className="text-xs text-gray-500 mt-1">House #1 baseline</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Moon Sign / House</CardTitle>
            <CardDescription>मन/भावनाको संकेत</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-semibold">{data.moon?.sign ?? "—"}</div>
            <div className="text-xs text-gray-500 mt-1">House: {data.moon?.house ?? "—"}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Current Dasha</CardTitle>
            <CardDescription>Active period (Vim./Yog.)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {data.currentDasha ? (
              <div>
                <div className="text-sm">System: <b>{data.currentDasha.system}</b></div>
                <div className="text-lg font-semibold mt-1">{data.currentDasha.maha}</div>
                <div className="text-xs text-gray-600 mt-1">Antar: {data.currentDasha.antara ?? "—"} · Praty.: {data.currentDasha.pratyantara ?? "—"}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No dasha data</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Transit Highlights</CardTitle>
            <CardDescription>गोचरका मुख्य बुँदा</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {(data.transitHighlights ?? []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
            <CardDescription>Quick tips</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {tips.length === 0 && <div className="text-sm text-gray-500">No tips</div>}
              {tips.map((grp, idx) => (
                <div key={idx}>
                  <div className="text-sm font-semibold">{grp.title}</div>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {grp.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DockedChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || sending) return;
    
    const userMessage = { role: "user" as const, content: text.trim() };
    setMessages((m) => [...m, userMessage]);
    setText("");
    setSending(true);

    try {
      // Call your chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.message || "Thanks for your message!" },
        ]);
      } else {
        throw new Error('Chat API failed');
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(980px,94vw)]">
      <Card className="rounded-2xl shadow-xl border-gray-200">
        <div className="grid grid-rows-[1fr_auto] max-h-[60vh]">
          <ScrollArea className="h-[34vh] p-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-6">
                  Ask anything about your kundali, dasha, or remedies…
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-xl text-sm shadow-sm ${m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
                    {m.content}
                  </div>
            </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-3 flex items-center gap-2">
            <Input
              placeholder="Send a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              className="rounded-xl"
              disabled={sending}
            />
            <Button onClick={send} className="rounded-xl" disabled={sending || !text.trim()}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquareText className="mr-2 h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </Card>
      </div>
  );
};

// ---- Page -----------------------------------------------------------------
export default function ZstroHome() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [astroLoading, setAstroLoading] = useState(true);
  const [astroData, setAstroData] = useState<AstroSummary | null>(null);
  const [networkInitialized, setNetworkInitialized] = useState(false);

  // Initialize ZSTRO Network
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const success = await initializeZstroNetwork();
        if (mounted) {
          setNetworkInitialized(success);
        }
      } catch (error) {
        console.error("Failed to initialize ZSTRO network:", error);
        if (mounted) {
          setNetworkInitialized(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setAstroLoading(false);
        setAstroData(null);
        return;
      }
      setAstroLoading(true);
      try {
        const res = await fetchAstroSummary(user.id);
        if (mounted) {
          setAstroData(res);
        }
      } catch (error) {
        console.error("Failed to fetch astro data:", error);
      } finally {
        if (mounted) {
          setAstroLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (authLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <TopBar user={user} onSignIn={signIn} onSignOut={signOut} />
      <Hero />
      <CtaGrid />

      {/* Personalized block appears when signed in & birth details exist */}
      {user && (
        <AstroCards 
          data={null} 
          lang="ne"
          showThemeToggle={true}
        />
      )}

      {/* Docked Chat Panel */}
      <DockedChat />
    </Container>
  );
}