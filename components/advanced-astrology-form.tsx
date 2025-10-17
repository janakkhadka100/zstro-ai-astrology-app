'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdvancedAstrologyFormProps {
  onSubmit: (data: AdvancedAstrologyRequest) => void;
  isLoading?: boolean;
}

interface AdvancedAstrologyRequest {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  question?: string;
  language: 'en' | 'ne' | 'hi';
  analysisType: 'basic' | 'advanced' | 'comprehensive' | 'maximum-detail';
}

export function AdvancedAstrologyForm({ onSubmit, isLoading = false }: AdvancedAstrologyFormProps) {
  const [formData, setFormData] = useState<AdvancedAstrologyRequest>({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    question: '',
    language: 'en',
    analysisType: 'comprehensive'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
      newErrors.birthDate = 'Please use YYYY-MM-DD format';
    }

    if (!formData.birthTime) {
      newErrors.birthTime = 'Birth time is required';
    } else if (!/^\d{2}:\d{2}(:\d{2})?$/.test(formData.birthTime)) {
      newErrors.birthTime = 'Please use HH:MM format';
    }

    if (!formData.birthPlace.trim()) {
      newErrors.birthPlace = 'Birth place is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof AdvancedAstrologyRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔯 Advanced Vedic Astrology Analysis
          <Badge variant="secondary">Deep Analysis</Badge>
        </CardTitle>
        <CardDescription>
          Get comprehensive astrological insights with detailed yoga analysis, dasha predictions, and Shadbala strength calculations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="analysis">Analysis Type</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={errors.birthDate ? 'border-red-500' : ''}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-red-500">{errors.birthDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthTime">Birth Time *</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange('birthTime', e.target.value)}
                    className={errors.birthTime ? 'border-red-500' : ''}
                  />
                  {errors.birthTime && (
                    <p className="text-sm text-red-500">{errors.birthTime}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthPlace">Birth Place *</Label>
                <Input
                  id="birthPlace"
                  placeholder="e.g., Kathmandu, Nepal"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  className={errors.birthPlace ? 'border-red-500' : ''}
                />
                {errors.birthPlace && (
                  <p className="text-sm text-red-500">{errors.birthPlace}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Specific Question (Optional)</Label>
                <Textarea
                  id="question"
                  placeholder="Ask a specific question about your horoscope..."
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <Select
                    value={formData.analysisType}
                    onValueChange={(value: 'basic' | 'advanced' | 'comprehensive' | 'maximum-detail') => 
                      handleInputChange('analysisType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        <div className="flex flex-col">
                          <span className="font-medium">Basic Analysis</span>
                          <span className="text-sm text-muted-foreground">
                            Planet positions, basic yogas, simple predictions
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex flex-col">
                          <span className="font-medium">Advanced Analysis</span>
                          <span className="text-sm text-muted-foreground">
                            Detailed yogas, dasha analysis, Shadbala strength
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="comprehensive">
                        <div className="flex flex-col">
                          <span className="font-medium">Comprehensive Analysis</span>
                          <span className="text-sm text-muted-foreground">
                            Full analysis with divisional charts, remedies, timing
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="maximum-detail">
                        <div className="flex flex-col">
                          <span className="font-medium">Maximum Detail Analysis</span>
                          <span className="text-sm text-muted-foreground">
                            Complete analysis with all charts, maximum data accuracy
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Analysis Features:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Planetary positions and dignities</li>
                    <li>• Rajyogas, Panchmahapurush Yogas, and special yogas</li>
                    <li>• Vimshottari and Yogini Dasha analysis</li>
                    <li>• Shadbala strength calculations</li>
                    <li>• Navamsha (D9) and Dashamsha (D10) insights</li>
                    <li>• Career, marriage, health, and spiritual predictions</li>
                    <li>• Specific remedies and recommendations</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: 'en' | 'ne' | 'hi') => 
                    handleInputChange('language', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ne">नेपाली (Nepali)</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                  🔮 Advanced Features
                </h4>
                <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Deep yoga detection and analysis</li>
                  <li>• Precise dasha timing predictions</li>
                  <li>• Shadbala strength calculations</li>
                  <li>• Divisional chart insights</li>
                  <li>• Cultural context and remedies</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  🔯 Get Advanced Analysis
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
