"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuggestCardProps {
  items: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function SuggestCard({ items, onSuggestionClick }: SuggestCardProps) {
  return (
    <Card id="card-suggest" className="rounded-2xl shadow-md bg-gradient-to-r from-purple-100 via-violet-100 to-indigo-100">
      <CardHeader className="text-center font-semibold text-purple-800">
        Suggested Questions
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-purple-700 text-center mb-4">
          Click on any question to start chatting:
        </div>
        <div className="space-y-2">
          {items?.slice(0, 3).map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto p-3 bg-white/75 hover:bg-white border-purple-200 text-purple-800 hover:text-purple-900"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <span className="text-sm">{suggestion}</span>
            </Button>
          ))}
        </div>
        {(!items || items.length === 0) && (
          <div className="text-center text-purple-600 py-4">
            No suggestions available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
