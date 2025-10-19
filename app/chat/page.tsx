"use client";
import { useState } from "react";
import { useUploads } from "@/hooks/useUploads";
import UploadBox from "@/components/UploadBox";
import FileCards from "@/components/FileCards";
import { ResultSummaryCard } from "@/components/astro/ResultSummaryCard";
import { ProfileCard } from "@/components/astro/ProfileCard";
import { PlanetTableCard } from "@/components/astro/PlanetTableCard";
import { ShadbalaTableCard } from "@/components/astro/ShadbalaTableCard";
import { DashaAccordion } from "@/components/astro/DashaAccordion";
import { PDFButtonCard } from "@/components/astro/PDFButtonCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Upload, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// Mock data for demonstration
const mockAstroData = {
  ascSignId: 2,
  ascSignLabel: "Taurus",
  planets: [
    {
      planet: "Sun" as const,
      signId: 9,
      signLabel: "Sagittarius",
      degree: 245.5,
      house: 7,
      safeHouse: 8,
      shadbala: {
        total: 150.25,
        sthana: 45.5,
        dig: 30.2,
        kala: 25.8,
        chestha: 20.1,
        naisargika: 28.65
      }
    },
    {
      planet: "Moon" as const,
      signId: 4,
      signLabel: "Cancer",
      degree: 95.3,
      house: 3,
      safeHouse: 3,
      shadbala: {
        total: 180.75,
        sthana: 50.2,
        dig: 35.1,
        kala: 30.5,
        chestha: 25.8,
        naisargika: 39.15
      }
    }
  ],
  vimshottariTree: [
    {
      name: "Sun",
      lord: "Sun",
      start: "2020-01-01T00:00:00.000Z",
      end: "2026-01-01T00:00:00.000Z",
      level: "MAHA",
      children: [
        {
          name: "Moon",
          lord: "Moon",
          start: "2020-01-01T00:00:00.000Z",
          end: "2021-01-01T00:00:00.000Z",
          level: "ANTAR"
        }
      ]
    }
  ],
  yoginiTree: [
    {
      name: "Sankata",
      lord: "Rahu",
      start: "2020-01-01T00:00:00.000Z",
      end: "2021-01-01T00:00:00.000Z",
      level: "YOGINI"
    }
  ],
  lang: "ne" as const,
  mismatches: [],
  dashaFixes: []
};

export default function ChatPage() {
  const { files, uploading, upload, add, remove } = useUploads();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>>([]);

  const handleUploaded = (file: { url: string; type: string; name: string; text?: string; meta?: any }) => {
    add(file);
    toast.success(`${file.name} uploaded successfully!`);
  };

  const handleSendToChat = (text: string) => {
    setMessage(prev => prev + (prev ? "\n\n" : "") + `[FILE CONTENT]\n${text}`);
    toast.info("File content added to message");
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: "assistant" as const,
        content: `I received your message: "${message}". This is a mock response. In a real implementation, this would be processed by an AI model.`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Astrology Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload files and chat with AI about your astrological data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Astro Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadBox 
                  onUploaded={handleUploaded}
                  uploading={uploading}
                />
              </CardContent>
            </Card>

            {/* File Cards */}
            <FileCards 
              items={files} 
              onSendToChat={handleSendToChat}
              onRemove={remove}
            />

            {/* Astro Summary */}
            <ResultSummaryCard 
              asc={mockAstroData.ascSignLabel}
              moon={mockAstroData.planets.find(p => p.planet === "Moon")?.signLabel || "Unknown"}
              loading={false}
            />

            {/* Profile Card */}
            <ProfileCard data={mockAstroData} />

            {/* PDF Export */}
            <PDFButtonCard 
              data={mockAstroData} 
              uploadedFiles={files.map(f => ({
                name: f.name,
                type: f.type,
                text: f.text,
                meta: f.meta
              }))}
            />
          </div>

          {/* Right Column - Chat & Astro Data */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              {/* Chat Interface */}
              <Card className="h-96 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat with AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Start a conversation by typing a message below</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Astro Data Cards */}
              <PlanetTableCard rows={mockAstroData.planets} />
              <ShadbalaTableCard rows={mockAstroData.planets} />
              <DashaAccordion 
                tree={mockAstroData.vimshottariTree} 
                title="विम्शोत्तरी दशा" 
                lang={mockAstroData.lang}
              />
              <DashaAccordion 
                tree={mockAstroData.yoginiTree} 
                title="योगिनी दशा" 
                lang={mockAstroData.lang}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
