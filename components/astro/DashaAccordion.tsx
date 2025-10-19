"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Calendar, Clock } from "lucide-react";

interface DashaBlock {
  name: string;
  lord: string;
  start: string;  // ISO UTC
  end: string;    // ISO UTC
  level: string;
  children?: DashaBlock[];
}

interface DashaAccordionProps {
  tree: DashaBlock[];
  title: string;
  lang: "ne" | "en";
}

export function DashaAccordion({ tree, title, lang }: DashaAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return "—"; // Invalid date
      }
      return isNepali 
        ? date.toLocaleDateString('ne-NP', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Asia/Kathmandu'
          })
        : date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Asia/Kathmandu'
          });
    } catch {
      return "—"; // Invalid date
    }
  };

  const formatDuration = (start: string, end: string): string => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "—";
      }
      
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} ${isNepali ? 'दिन' : 'days'}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${isNepali ? 'महिना' : 'months'}`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        return `${years}${isNepali ? ' वर्ष' : 'y'} ${remainingMonths > 0 ? remainingMonths + (isNepali ? 'म' : 'm') : ''}`;
      }
    } catch {
      return "—";
    }
  };

  const isNepali = lang === "ne";

  const renderDashaItem = (dasha: DashaBlock, level: number = 0, parentId: string = ""): React.ReactNode => {
    const itemId = `${parentId}-${dasha.name}-${dasha.start}`;
    const isExpanded = expandedItems.has(itemId);
    const hasChildren = dasha.children && dasha.children.length > 0;
    const indentClass = `ml-${Math.min(level * 4, 16)}`;

    return (
      <div key={itemId} className={`${indentClass} border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(itemId)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {dasha.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({dasha.lord})
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {dasha.level}
                </span>
              </div>
            </div>
            
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(dasha.start)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(dasha.start, dasha.end)}</span>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {dasha.children!.map((child, index) => 
              renderDashaItem(child, level + 1, itemId)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!tree || tree.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {isNepali ? "दशा डेटा उपलब्ध छैन" : "No dasha data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tree.map((dasha, index) => renderDashaItem(dasha, 0, `root-${index}`))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>{isNepali ? "स्तर:" : "Levels:"}</strong></p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                MAHA {isNepali ? "(महा)" : ""}
              </span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                ANTAR {isNepali ? "(अन्तर)" : ""}
              </span>
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                PRATYANTAR {isNepali ? "(प्रत्यन्तर)" : ""}
              </span>
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                SUKSHMA {isNepali ? "(सूक्ष्म)" : ""}
              </span>
              <span className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded">
                PRANA {isNepali ? "(प्राण)" : ""}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
