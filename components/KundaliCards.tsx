"use client";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function KundaliCards({data}:{data:any}){
  const { lang } = useLang();
  const s = strings[lang];
  
  if(!data) return (
    <div className="rounded-xl bg-gradient-to-r from-indigo-100 via-sky-100 to-pink-100 p-6 shadow-lg border border-indigo-200/50">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="font-semibold text-indigo-700 text-lg mb-2">No Kundali Data Yet</div>
        <div className="text-sm opacity-70">Start a chat to generate your chart and get personalized insights.</div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      {/* Birth Summary Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-100 via-sky-100 to-pink-100 p-6 shadow-lg border border-indigo-200/50 transition-all hover:shadow-xl">
        <h3 className="font-semibold text-indigo-800 text-lg mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Birth Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-xs text-indigo-600 font-medium mb-1">Ascendant</div>
            <div className="text-lg font-bold text-indigo-800">{data.asc}</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-xs text-indigo-600 font-medium mb-1">Moon Sign</div>
            <div className="text-lg font-bold text-indigo-800">{data.moon}</div>
          </div>
        </div>
      </div>

      {/* Mahadasha Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-100 via-green-100 to-lime-100 p-6 shadow-lg border border-emerald-200/50 transition-all hover:shadow-xl">
        <h3 className="font-semibold text-emerald-800 text-lg mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Mahadasha Periods
        </h3>
        <ul className="space-y-2">
          {data.mahadasha?.map((m:any,i:number)=>(
            <li key={i} className="bg-white/60 rounded-lg p-3 flex justify-between items-center">
              <span className="font-medium text-emerald-800">{m.name}</span>
              <span className="text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{m.period}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Info Card */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-100 via-violet-100 to-indigo-100 p-6 shadow-lg border border-purple-200/50 transition-all hover:shadow-xl">
        <h3 className="font-semibold text-purple-800 text-lg mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Analysis Status
        </h3>
        <div className="text-sm text-purple-700 mb-4">
          Your kundali has been analyzed and is ready for detailed consultation. 
          Ask specific questions about your chart, planetary positions, or upcoming periods.
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert("PDF download coming soon!")}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button 
            onClick={() => alert("Share feature coming soon!")}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
