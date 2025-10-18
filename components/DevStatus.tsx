'use client';

import { useState, useEffect } from 'react';

interface DevStatusProps {
  dataLoaded: boolean;
  activeTab?: string;
  lastApiMs?: number;
}

export default function DevStatus({ dataLoaded, activeTab, lastApiMs }: DevStatusProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50">
      <div>Data: {dataLoaded ? '✅' : '❌'}</div>
      {activeTab && <div>Tab: {activeTab}</div>}
      {lastApiMs && <div>API: {lastApiMs}ms</div>}
    </div>
  );
}
