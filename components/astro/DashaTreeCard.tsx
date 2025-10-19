"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { DashaNode } from "@/lib/astro-types";
import { useState } from "react";

export default function DashaTreeCard({ 
  title, 
  tree, 
  loading 
}: {
  title: string;
  tree: DashaNode[];
  loading?: boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 animate-pulse rounded-2xl shadow-md">
        <CardHeader className="h-8" />
        <CardContent className="h-48" />
      </Card>
    );
  }

  if (!tree || tree.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-violet-800">{title}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const isActive = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    return now >= startDate && now <= endDate;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'en' ? 'en-US' : 'hi-IN');
    } catch {
      return dateStr;
    }
  };

  const renderDashaNode = (node: DashaNode, level: number = 0) => {
    const nodeId = `${node.name}-${node.start}`;
    const isExpanded = expanded[nodeId];
    const active = isActive(node.start, node.end);
    
    return (
      <div key={nodeId} className={`ml-${level * 4} ${level > 0 ? 'border-l-2 border-violet-200 pl-2' : ''}`}>
        <div 
          className={`p-2 rounded-lg cursor-pointer transition-colors ${
            active 
              ? 'bg-violet-200 border-2 border-violet-400' 
              : 'bg-white/70 hover:bg-white/90'
          }`}
          onClick={() => setExpanded(prev => ({ ...prev, [nodeId]: !isExpanded }))}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-violet-900">
                {node.name} ({node.lord})
              </div>
              <div className="text-xs text-violet-600">
                {formatDate(node.start)} - {formatDate(node.end)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {active && (
                <span className="px-2 py-1 bg-violet-500 text-white text-xs rounded-full">
                  {t.active_now}
                </span>
              )}
              {node.children && node.children.length > 0 && (
                <span className="text-violet-600 text-xs">
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && node.children && (
          <div className="mt-2 space-y-1">
            {node.children.map((child, index) => 
              renderDashaNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-violet-800">{title}</CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {tree.map((node, index) => renderDashaNode(node))}
      </CardContent>
    </Card>
  );
}
