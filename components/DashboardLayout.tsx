"use client";
import { useState, useRef, useEffect } from "react";
import HistorySidebar from "./HistorySidebar";
import KundaliCards from "./KundaliCards";
import ChatPanel from "./ChatPanel";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function DashboardLayout(){
  const [messages,setMessages]=useState<{role:"user"|"ai";text:string}[]>([]);
  const [kundaliData,setKundaliData]=useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const s = strings[lang];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('dashboard-messages');
    const savedKundaliData = localStorage.getItem('dashboard-kundali');
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedKundaliData) {
      setKundaliData(JSON.parse(savedKundaliData));
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-messages', JSON.stringify(messages));
  }, [messages]);

  // Save kundali data to localStorage
  useEffect(() => {
    if (kundaliData) {
      localStorage.setItem('dashboard-kundali', JSON.stringify(kundaliData));
    }
  }, [kundaliData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if AI reply contains kundali data and update accordingly
  const handleSend = (msg: string) => {
    setMessages(m=>[...m,{role:"user",text:msg}]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = `AI reply about: ${msg}`;
      setMessages(m=>[...m,{role:"ai",text:aiResponse}]);
      
      // If message contains kundali keywords, generate sample data
      if (msg.toLowerCase().includes('kundali') || msg.toLowerCase().includes('chart') || msg.toLowerCase().includes('birth')) {
        setKundaliData({
          asc: "Taurus",
          moon: "Capricorn",
          mahadasha: [
            { name: "Ketu", period: "2020-2027" },
            { name: "Venus", period: "2027-2047" },
            { name: "Sun", period: "2047-2053" }
          ]
        });
      }
    }, 300);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50">
      {/* Sidebar */}
      <HistorySidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <KundaliCards data={kundaliData}/>
          <div className="space-y-2">
            {messages.map((m,i)=>(
              <div key={i} className={`max-w-xl ${m.role==="user"?"ml-auto":"mr-auto"} bg-white/80 rounded-2xl p-3 shadow transition-all hover:shadow-md`}>
                <div className={`text-xs opacity-60 mb-1 ${m.role==="user"?"text-right":"text-left"}`}>
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div className="text-sm">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <ChatPanel onSend={handleSend}/>
      </div>
    </div>
  );
}
