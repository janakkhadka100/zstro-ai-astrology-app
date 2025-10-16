// components/astrology-history.tsx
// History section component for past consultations

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Search, 
  Calendar, 
  Clock, 
  Star, 
  Download, 
  Trash2, 
  Eye,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface ConsultationHistory {
  id: string;
  title: string;
  question: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  createdAt: string;
  updatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  insights?: string[];
  rating?: number;
}

interface AstrologyHistoryProps {
  userId?: string;
  onSelectConsultation?: (consultation: ConsultationHistory) => void;
  onDeleteConsultation?: (id: string) => void;
  onExportConsultation?: (consultation: ConsultationHistory) => void;
}

export function AstrologyHistory({ 
  userId, 
  onSelectConsultation, 
  onDeleteConsultation, 
  onExportConsultation 
}: AstrologyHistoryProps) {
  const [consultations, setConsultations] = useState<ConsultationHistory[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockConsultations: ConsultationHistory[] = [
      {
        id: '1',
        title: 'Career Guidance',
        question: 'What does my chart say about my career prospects?',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Kathmandu, Nepal',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:45:00Z',
        status: 'completed',
        insights: ['Strong 10th house', 'Jupiter in career house', 'Saturn aspecting career'],
        rating: 5,
      },
      {
        id: '2',
        title: 'Relationship Analysis',
        question: 'When will I find my life partner?',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Kathmandu, Nepal',
        createdAt: '2024-01-10T15:20:00Z',
        updatedAt: '2024-01-10T15:35:00Z',
        status: 'completed',
        insights: ['Venus in 7th house', 'Mars aspecting relationships', 'Jupiter transit coming'],
        rating: 4,
      },
      {
        id: '3',
        title: 'Health Concerns',
        question: 'Are there any health issues indicated in my chart?',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Kathmandu, Nepal',
        createdAt: '2024-01-05T09:15:00Z',
        updatedAt: '2024-01-05T09:30:00Z',
        status: 'completed',
        insights: ['6th house analysis', 'Mars in health house', 'Saturn aspects'],
        rating: 3,
      },
    ];

    setConsultations(mockConsultations);
    setFilteredConsultations(mockConsultations);
    setLoading(false);
  }, [userId]);

  // Filter and sort consultations
  useEffect(() => {
    let filtered = consultations;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(consultation =>
        consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultation.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'date') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredConsultations(filtered);
  }, [consultations, searchQuery, sortBy, sortOrder, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading consultation history...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Consultation History</h2>
          <Badge variant="secondary">{filteredConsultations.length}</Badge>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export All
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consultations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Consultations List */}
      <div className="space-y-3">
        {filteredConsultations.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Consultations Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No consultations match your search criteria.' : 'You haven\'t had any consultations yet.'}
              </p>
            </div>
          </Card>
        ) : (
          filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{consultation.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {consultation.question}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusBadge(consultation.status)}
                    {consultation.rating && (
                      <div className="flex items-center space-x-1">
                        {renderStars(consultation.rating)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{consultation.birthDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{consultation.birthTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(consultation.createdAt)}</span>
                  </div>
                </div>

                {/* Insights Preview */}
                {consultation.insights && consultation.insights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Insights:</h4>
                    <div className="flex flex-wrap gap-1">
                      {consultation.insights.slice(0, 3).map((insight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {insight}
                        </Badge>
                      ))}
                      {consultation.insights.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{consultation.insights.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDate(consultation.updatedAt)} at {formatTime(consultation.updatedAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectConsultation?.(consultation)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExportConsultation?.(consultation)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteConsultation?.(consultation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
