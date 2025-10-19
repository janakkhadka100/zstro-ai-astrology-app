"use client";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function HistorySidebar(){
  const { lang } = useLang();
  const s = strings[lang];
  
  const items = [
    "कुण्डली विवरण",
    "आजको राशिफल", 
    "विवाह रिपोर्ट",
    "धन योग",
    "ज्योतिष PDF"
  ];
  
  return (
    <aside className="w-64 bg-white/70 border-r backdrop-blur-md overflow-y-auto hidden md:block">
      <div className="p-4 font-semibold text-indigo-700 border-b border-indigo-200/50">
        ZSTRO AI
      </div>
      <div className="p-2">
        <div className="text-xs text-gray-500 mb-2 px-2">Recent Analysis</div>
        <ul className="space-y-1 text-sm">
          {items.map((i,idx)=>(
            <li key={idx} className="p-2 hover:bg-indigo-100 rounded-md cursor-pointer transition-colors duration-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              {i}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-2 mt-4">
        <div className="text-xs text-gray-500 mb-2 px-2">Quick Actions</div>
        <ul className="space-y-1 text-sm">
          <li className="p-2 hover:bg-emerald-100 rounded-md cursor-pointer transition-colors duration-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Generate New Chart
          </li>
          <li className="p-2 hover:bg-blue-100 rounded-md cursor-pointer transition-colors duration-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Download PDF
          </li>
          <li className="p-2 hover:bg-purple-100 rounded-md cursor-pointer transition-colors duration-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Share Report
          </li>
        </ul>
      </div>
    </aside>
  );
}
