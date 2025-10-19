"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DashaNode } from "@/lib/astro-contract";
import { useState } from "react";

interface DashaCardProps {
  title: string;
  tree: DashaNode[];
}

export default function DashaCard({ title, tree }: DashaCardProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const renderNode = (node: DashaNode, level: number = 0) => {
    const nodeId = `${node.name}-${node.start}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={nodeId} className="border-l-2 border-amber-300/50 pl-4">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-amber-50 ${
            level === 0 ? "bg-amber-100/50" : "bg-white/50"
          }`}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          <div className="flex-1">
            <div className="font-medium text-amber-800">
              {node.name} ({node.lord})
            </div>
            <div className="text-xs text-amber-600">
              {formatDate(node.start)} - {formatDate(node.end)}
            </div>
          </div>
          {hasChildren && (
            <div className="text-amber-600">
              {isExpanded ? "▼" : "▶"}
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-1">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card id="card-vimshottari" className="rounded-2xl shadow-md bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100">
      <CardHeader className="text-center font-semibold text-amber-800">
        {title}
      </CardHeader>
      <CardContent className="space-y-3">
        {tree?.length ? (
          <div className="space-y-2">
            {tree.slice(0, 3).map(node => renderNode(node))}
            {tree.length > 3 && (
              <div className="text-xs text-amber-600 text-center pt-2">
                +{tree.length - 3} more periods
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-amber-600 py-4">
            No dasha data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
