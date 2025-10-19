"use client";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function ChatPanel({onSend}:{onSend:(msg:string)=>void}){
  const [msg,setMsg]=useState("");
  const { lang } = useLang();
  const s = strings[lang];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!msg.trim()) return;
    onSend(msg);
    setMsg("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
      <div className="flex-1 relative">
        <input 
          value={msg} 
          onChange={e=>setMsg(e.target.value)} 
          placeholder={s.chat_ph || "Ask or analyze kundali..."} 
          className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white/90"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <button 
        type="submit" 
        disabled={!msg.trim()}
        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
      >
        <span>{s.send || "Send"}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
