"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { VargaMini } from "@/lib/astro-types";

export default function VargaTiles({ items, loading }: {
  items: VargaMini[];
  loading?: boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 animate-pulse rounded-2xl shadow-md">
        <CardHeader className="h-8" />
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-amber-800">{t.varga}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const getVargaTitle = (id: string) => {
    const titles: Record<string, string> = {
      'D9': t.navamsa,
      'D10': t.dasamsa,
      'D7': t.saptamsa,
      'D12': t.dwadasamsa,
      'D20': t.vimsamsa,
      'D60': t.shashtyamsa
    };
    return titles[id] || id;
  };

  const getVargaDescription = (id: string) => {
    const descriptions: Record<string, string> = {
      'D9': t.marriage,
      'D10': t.career,
      'D7': t.children,
      'D12': t.parents,
      'D20': t.spirituality,
      'D60': t.karma
    };
    return descriptions[id] || '';
  };

  const getGradientClass = (id: string) => {
    const gradients: Record<string, string> = {
      'D9': 'from-pink-200 via-rose-200 to-red-200',
      'D10': 'from-blue-200 via-indigo-200 to-purple-200',
      'D7': 'from-green-200 via-emerald-200 to-teal-200',
      'D12': 'from-yellow-200 via-amber-200 to-orange-200',
      'D20': 'from-purple-200 via-violet-200 to-fuchsia-200',
      'D60': 'from-gray-200 via-slate-200 to-zinc-200'
    };
    return gradients[id] || 'from-amber-200 via-yellow-200 to-orange-200';
  };

  return (
    <Card className="bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-amber-800">{t.varga}</CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {items.map((varga) => (
          <div 
            key={varga.id}
            className={`bg-gradient-to-br ${getGradientClass(varga.id)} rounded-xl p-3 shadow-sm`}
          >
            <div className="text-sm font-medium text-amber-900 mb-1">
              {getVargaTitle(varga.id)}
            </div>
            <div className="text-xs text-amber-700 mb-2">
              {getVargaDescription(varga.id)}
            </div>
            {varga.verdict && (
              <div className="text-xs text-amber-800 bg-white/50 rounded px-2 py-1">
                {varga.verdict}
              </div>
            )}
            {varga.keyHints && varga.keyHints.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-amber-600 font-medium">Key Points:</div>
                <div className="text-xs text-amber-700">
                  {varga.keyHints.slice(0, 2).join(', ')}
                  {varga.keyHints.length > 2 && '...'}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
