'use client';

import { useState } from 'react';
import { AstrologyForm } from '@/components/astrology-form';
import { AdvancedAstrologyForm } from '@/components/advanced-astrology-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function AstrologyPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdvancedSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Call the advanced astrology API
      const response = await fetch('/api/astrology-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get astrology analysis');
      }

      // Handle the streaming response
      const reader = response.body?.getReader();
      if (reader) {
        // Process the streamed response
        // This would typically be handled by a chat component
        console.log('Advanced astrology analysis received');
      }
    } catch (error) {
      console.error('Error getting astrology analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="container mx-auto py-4 md:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold mb-4">🔯 AI Astrology Insights</h1>
          <p className="text-muted-foreground mb-8">
            Get personalized astrological insights based on your birth chart and cosmic alignments.
          </p>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                🔮 Basic Analysis
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                🔯 Advanced Analysis
                <Badge variant="secondary" className="ml-1">New</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="max-w-2xl mx-auto">
                <AstrologyForm />
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedAstrologyForm 
                onSubmit={handleAdvancedSubmit}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}