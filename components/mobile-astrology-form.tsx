// components/mobile-astrology-form.tsx
// Mobile-optimized astrology form with collapsible sections

'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle,
  Star,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { UserQuery } from '@/lib/prokerala/types';

interface MobileAstrologyFormProps {
  onDataSubmit?: (data: UserQuery) => void;
  className?: string;
}

export function MobileAstrologyForm({ onDataSubmit, className = '' }: MobileAstrologyFormProps) {
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('basic');
  const [formData, setFormData] = useState<UserQuery>({
    question: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { messages, setMessages } = useChat({
    api: '/api/astrology',
    id: 'mobile-astrology-chat',
    onResponse: () => setLoading(false),
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.birthDate) {
      errors.birthDate = 'Birth date is required';
    } else {
      const date = new Date(formData.birthDate);
      if (isNaN(date.getTime()) || date > new Date()) {
        errors.birthDate = 'Please enter a valid birth date';
      }
    }

    if (!formData.birthTime) {
      errors.birthTime = 'Birth time is required';
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!timeRegex.test(formData.birthTime)) {
        errors.birthTime = 'Please enter time in HH:MM format';
      }
    }

    if (!formData.birthPlace || formData.birthPlace.trim().length < 2) {
      errors.birthPlace = 'Birth place is required';
    }

    if (!formData.question || formData.question.trim().length < 10) {
      errors.question = 'Please ask a specific question (at least 10 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof UserQuery, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessages([]);

    try {
      const response = await fetch('/api/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get astrological reading');
      }

      setShowForm(false);
      onDataSubmit?.(formData);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleNewReading = () => {
    setShowForm(true);
    setMessages([]);
    setFormData({
      question: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
    });
    setValidationErrors({});
  };

  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: <Calendar className="size-4" />,
      description: 'Your birth details',
    },
    {
      id: 'question',
      title: 'Your Question',
      icon: <MessageCircle className="size-4" />,
      description: 'What would you like to know?',
    },
    {
      id: 'preview',
      title: 'Preview & Submit',
      icon: <CheckCircle className="size-4" />,
      description: 'Review and submit your request',
    },
  ];

  if (!showForm) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                {message.role === 'user' ? (
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Star className="size-4 mt-0.5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Your Question</p>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Zap className="size-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">AI Response</p>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Reading the cosmic patterns...</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button onClick={handleNewReading} className="w-full">
              New Astrological Reading
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">AI Astrology Consultation</h2>
          <p className="text-sm text-muted-foreground">
            Get personalized insights based on your birth chart
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Navigation */}
          <div className="flex space-x-2 mb-6">
            {sections.map((section, index) => (
              <Button
                key={section.id}
                type="button"
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className="flex-1 flex items-center space-x-1"
              >
                {section.icon}
                <span className="hidden sm:inline">{section.title}</span>
              </Button>
            ))}
          </div>

          {/* Basic Information Section */}
          <Collapsible open={activeSection === 'basic'} onOpenChange={(open) => open && setActiveSection('basic')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Calendar className="size-4" />
                  <span>Birth Information</span>
                </div>
                {activeSection === 'basic' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={validationErrors.birthDate ? 'border-red-500' : ''}
                  />
                  {validationErrors.birthDate && (
                    <p className="text-xs text-red-500 flex items-center space-x-1">
                      <AlertCircle className="size-3" />
                      <span>{validationErrors.birthDate}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthTime">Birth Time *</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange('birthTime', e.target.value)}
                    className={validationErrors.birthTime ? 'border-red-500' : ''}
                  />
                  {validationErrors.birthTime && (
                    <p className="text-xs text-red-500 flex items-center space-x-1">
                      <AlertCircle className="size-3" />
                      <span>{validationErrors.birthTime}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthPlace">Birth Place *</Label>
                <Input
                  id="birthPlace"
                  placeholder="City, Country"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  className={validationErrors.birthPlace ? 'border-red-500' : ''}
                />
                {validationErrors.birthPlace && (
                  <p className="text-xs text-red-500 flex items-center space-x-1">
                    <AlertCircle className="size-3" />
                    <span>{validationErrors.birthPlace}</span>
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Question Section */}
          <Collapsible open={activeSection === 'question'} onOpenChange={(open) => open && setActiveSection('question')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="size-4" />
                  <span>Your Question</span>
                </div>
                {activeSection === 'question' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="question">What would you like to know? *</Label>
                <Textarea
                  id="question"
                  placeholder="Ask about your career, relationships, health, or any specific aspect of your life..."
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  className={`min-h-[100px] ${validationErrors.question ? 'border-red-500' : ''}`}
                />
                {validationErrors.question && (
                  <p className="text-xs text-red-500 flex items-center space-x-1">
                    <AlertCircle className="size-3" />
                    <span>{validationErrors.question}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Be specific about what you'd like to know. The more detailed your question, the better the insights.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Preview Section */}
          <Collapsible open={activeSection === 'preview'} onOpenChange={(open) => open && setActiveSection('preview')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="size-4" />
                  <span>Preview & Submit</span>
                </div>
                {activeSection === 'preview' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium">Review Your Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Birth Date:</strong> {formData.birthDate || 'Not provided'}</p>
                  <p><strong>Birth Time:</strong> {formData.birthTime || 'Not provided'}</p>
                  <p><strong>Birth Place:</strong> {formData.birthPlace || 'Not provided'}</p>
                  <p><strong>Question:</strong> {formData.question || 'Not provided'}</p>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Consulting the stars...
                  </>
                ) : (
                  'Get Astrological Reading'
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Card>
    </div>
  );
}
