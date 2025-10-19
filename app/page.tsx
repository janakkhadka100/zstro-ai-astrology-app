'use client';

import Link from 'next/link';
import { Star, Sun, Moon, Users, Download, Sparkles, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Star,
    title: 'Kundali Generator',
    description: 'Generate accurate birth charts with detailed planetary positions and analysis',
    href: '/kundali',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Sun,
    title: 'Daily Horoscope',
    description: 'Get personalized daily predictions for all 12 zodiac signs',
    href: '/daily-horoscope',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Users,
    title: 'Compatibility Check',
    description: 'Check relationship compatibility between two people',
    href: '/compatibility',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Download beautiful PDF reports of your astrological analysis',
    href: '/kundali',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    icon: Layout,
    title: 'All Cards View',
    description: 'Comprehensive dashboard with all astrology cards and analysis',
    href: '/cards',
    color: 'from-emerald-500 to-teal-500'
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ZSTRO AI ASTROLOGY
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Nepal's first AI-powered astrology service. Get accurate kundali, horoscope, 
              and compatibility analysis powered by advanced artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/kundali">
                  <Star className="w-5 h-5 mr-2" />
                  Generate Kundali
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/daily-horoscope">
                  <Sun className="w-5 h-5 mr-2" />
                  Daily Horoscope
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Link href="/cards">
                  <Layout className="w-5 h-5 mr-2" />
                  View All Cards
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Astrology Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the future with our comprehensive AI-powered astrology tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                      {feature.description}
                    </CardDescription>
                    <Button asChild className="w-full">
                      <Link href={feature.href}>
                        Get Started
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Kundalis Generated</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Accuracy Rate</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">AI Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Discover Your Future?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust ZSTRO AI for accurate astrological insights
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
            <Link href="/kundali">
              <Star className="w-5 h-5 mr-2" />
              Start Your Journey
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
