// components/LanguageSwitcher.tsx
// Language Switcher Component for ZSTRO AI

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useLanguageSwitcher } from '@/lib/i18n/context';
import { languageOptions, SupportedLanguage } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function LanguageSwitcher({ 
  className = '', 
  variant = 'ghost', 
  size = 'default',
  showLabel = true 
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageSwitcher();

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    // Force page refresh to update all components
    window.location.reload();
  };

  const currentLanguage = languageOptions.find(option => option.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLanguage?.flag} {currentLanguage?.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleLanguageChange(option.code as SupportedLanguage)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{option.flag}</span>
              <span>{option.name}</span>
            </div>
            {language === option.code && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile
export function LanguageSwitcherCompact({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher 
      className={className}
      variant="ghost"
      size="sm"
      showLabel={false}
    />
  );
}

// Full version with label
export function LanguageSwitcherFull({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher 
      className={className}
      variant="outline"
      size="default"
      showLabel={true}
    />
  );
}
