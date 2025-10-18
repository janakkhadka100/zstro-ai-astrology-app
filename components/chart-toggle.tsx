// components/chart-toggle.tsx
// Chart toggle component for North Indian and South Indian chart styles

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Compass, 
  Map, 
  RotateCcw, 
  Download, 
  Share2,
  Settings,
  Info
} from 'lucide-react';

interface ChartToggleProps {
  chartData?: any;
  onChartTypeChange?: (type: 'north' | 'south') => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function ChartToggle({ 
  chartData, 
  onChartTypeChange, 
  onDownload, 
  onShare 
}: ChartToggleProps) {
  const [chartType, setChartType] = useState<'north' | 'south'>('north');
  const [isRotating, setIsRotating] = useState(false);

  const handleChartTypeChange = (type: 'north' | 'south') => {
    setChartType(type);
    onChartTypeChange?.(type);
  };

  const handleRotate = () => {
    setIsRotating(true);
    // Simulate rotation animation
    setTimeout(() => {
      setIsRotating(false);
    }, 1000);
  };

  const chartInfo = {
    north: {
      name: 'North Indian Chart',
      description: 'Traditional North Indian style with houses arranged in a square pattern',
      features: ['Square house arrangement', 'Ascendant at top', 'Traditional layout'],
      icon: <Compass className="size-5" />
    },
    south: {
      name: 'South Indian Chart',
      description: 'South Indian style with houses arranged in a diamond pattern',
      features: ['Diamond house arrangement', 'Ascendant at left', 'Modern layout'],
      icon: <Map className="size-5" />
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chart Style</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === 'north' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartTypeChange('north')}
              className="flex items-center space-x-1"
            >
              <Compass className="size-4" />
              <span>North Indian</span>
            </Button>
            <Button
              variant={chartType === 'south' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartTypeChange('south')}
              className="flex items-center space-x-1"
            >
              <Map className="size-4" />
              <span>South Indian</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {chartInfo.north.icon}
              <span className="font-medium">{chartInfo.north.name}</span>
              {chartType === 'north' && <Badge variant="secondary">Active</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {chartInfo.north.description}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {chartInfo.north.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {chartInfo.south.icon}
              <span className="font-medium">{chartInfo.south.name}</span>
              {chartType === 'south' && <Badge variant="secondary">Active</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {chartInfo.south.description}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {chartInfo.south.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Chart Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chart Controls</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              disabled={isRotating}
              className="flex items-center space-x-1"
            >
              <RotateCcw className={`size-4 ${isRotating ? 'animate-spin' : ''}`} />
              <span>Rotate</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex items-center space-x-1"
            >
              <Download className="size-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="flex items-center space-x-1"
            >
              <Share2 className="size-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              {chartType === 'north' ? (
                <div className="size-32 border-2 border-primary rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Compass className="size-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">North Indian</p>
                    <p className="text-xs text-muted-foreground">Square Layout</p>
                  </div>
                </div>
              ) : (
                <div className="size-32 border-2 border-primary rounded-lg flex items-center justify-center rotate-45">
                  <div className="text-center -rotate-45">
                    <Map className="size-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">South Indian</p>
                    <p className="text-xs text-muted-foreground">Diamond Layout</p>
                  </div>
                </div>
              )}
            </div>
            
            {chartData ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Chart data loaded successfully
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline">12 Houses</Badge>
                  <Badge variant="outline">9 Planets</Badge>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No chart data available
                </p>
                <p className="text-xs text-muted-foreground">
                  Generate a birth chart to see the visualization
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Chart Information */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="size-5" />
          <h3 className="text-lg font-semibold">Chart Information</h3>
        </div>
        
        <Tabs defaultValue="houses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="houses">Houses</TabsTrigger>
            <TabsTrigger value="planets">Planets</TabsTrigger>
            <TabsTrigger value="aspects">Aspects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="houses" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="p-2 border rounded text-center">
                  <div className="text-sm font-medium">H{i + 1}</div>
                  <div className="text-xs text-muted-foreground">
                    {i === 0 ? 'Ascendant' : `House ${i + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="planets" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].map((planet) => (
                <div key={planet} className="p-2 border rounded text-center">
                  <div className="text-sm font-medium">{planet}</div>
                  <div className="text-xs text-muted-foreground">Planet</div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="aspects" className="mt-4">
            <div className="space-y-2">
              <div className="p-2 border rounded">
                <div className="text-sm font-medium">Conjunction</div>
                <div className="text-xs text-muted-foreground">Planets in same house</div>
              </div>
              <div className="p-2 border rounded">
                <div className="text-sm font-medium">Opposition</div>
                <div className="text-xs text-muted-foreground">Planets 180° apart</div>
              </div>
              <div className="p-2 border rounded">
                <div className="text-sm font-medium">Trine</div>
                <div className="text-xs text-muted-foreground">Planets 120° apart</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
