'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Archive, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Interaction {
  id: string;
  timestamp: string;
  type: 'user' | 'ai';
  text: string;
  persona?: string;
}

const mockMemory: Interaction[] = [
  { id: "1", timestamp: "2024-07-28T10:05:00Z", type: 'user', text: "Hello PrabhAI, how are you today?" },
  { id: "2", timestamp: "2024-07-28T10:05:30Z", type: 'ai', text: "As your Friend, I'm doing great! Thanks for asking.", persona: "Friend" },
  { id: "3", timestamp: "2024-07-27T15:30:00Z", type: 'user', text: "Can you tell me about the latest AI news?" },
  { id: "4", timestamp: "2024-07-27T15:31:00Z", type: 'ai', text: "Certainly! There was a Global Tech Summit recently that highlighted major AI advancements...", persona: "Professional Assistant" },
  { id: "5", timestamp: "2024-07-26T09:00:00Z", type: 'user', text: "What's my favorite color?" },
  { id: "6", timestamp: "2024-07-26T09:00:15Z", type: 'ai', text: "You haven't told me your favorite color yet! Would you like to share it?", persona: "Friend"},
];

export default function MemoryPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate fetching memory
    setIsLoading(true);
    setTimeout(() => {
      const storedMemory = localStorage.getItem('prabhAiMemory');
      if (storedMemory) {
        setInteractions(JSON.parse(storedMemory));
      } else {
        setInteractions(mockMemory);
        localStorage.setItem('prabhAiMemory', JSON.stringify(mockMemory));
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear all remembered interactions? This action cannot be undone.")) {
      localStorage.removeItem('prabhAiMemory');
      setInteractions([]);
      // In a real app, notify backend
    }
  };
  
  const filteredInteractions = interactions.filter(interaction =>
    interaction.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (interaction.persona && interaction.persona.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Unforgettable Memory
          </CardTitle>
          <CardDescription>
            PrabhAI remembers past interactions to provide a more personalized experience. Review and manage remembered data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search memory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleClearMemory} variant="destructive" size="icon" aria-label="Clear memory">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading memory...</p>
          ) : (
            <ScrollArea className="h-[50vh] w-full rounded-md border p-4 bg-muted/20">
              {filteredInteractions.length > 0 ? (
                <div className="space-y-4">
                  {filteredInteractions.map(interaction => (
                    <div key={interaction.id} className={`flex ${interaction.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg max-w-[70%] ${interaction.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border'}`}>
                        <p className="text-sm">{interaction.text}</p>
                        <div className="text-xs opacity-70 mt-1 flex justify-between items-center">
                          <span>{new Date(interaction.timestamp).toLocaleString()}</span>
                          {interaction.persona && <Badge variant="secondary" className="ml-2">{interaction.persona}</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No interactions found or memory is empty.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Memory is currently stored locally in your browser for demonstration.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
