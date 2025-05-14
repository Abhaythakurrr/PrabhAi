
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Archive, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

interface Interaction {
  id: string;
  timestamp: string; // ISO string
  type: 'user' | 'ai';
  text: string;
  persona?: string;
}

const MEMORY_KEY = 'prabhAiMemory';

// Mock memory is now only a very basic fallback if needed, but primary source is localStorage
const initialMockMemory: Interaction[] = [
  { id: "mock1", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'user', text: "Hey Prabh, what was our last chat about?" },
  { id: "mock2", timestamp: new Date(Date.now() - 1000 * 60 * 59 * 2).toISOString(), type: 'ai', text: "We were just starting our brilliant conversation, friend! What's on your mind?", persona: "Friend" },
];


export default function MemoryPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loadMemory = () => {
    setIsLoading(true);
    try {
      const storedMemory = localStorage.getItem(MEMORY_KEY);
      if (storedMemory) {
        const parsedMemory = JSON.parse(storedMemory);
        // Ensure timestamps are valid dates for sorting, though they should be ISO strings
        const validatedMemory = parsedMemory.map((item: Interaction) => ({
          ...item,
          timestamp: item.timestamp || new Date(0).toISOString(), // Fallback for safety
        }));
        setInteractions(validatedMemory);
      } else {
        setInteractions([]); // Start with empty if no memory, no seeding with mock
      }
    } catch (error) {
      console.error("Error loading or parsing memory from localStorage:", error);
      setInteractions([]); // Fallback to empty on error
      toast({
        variant: "destructive",
        title: "Memory Read Error",
        description: "Prabh couldn't recall previous interactions from storage."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemory();
  }, []);

  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear all remembered interactions? Prabh will miss them, but okay... This action cannot be undone.")) {
      localStorage.removeItem(MEMORY_KEY);
      setInteractions([]);
      toast({
        title: "Memory Wiped!",
        description: "Prabh's memory of your chats has been cleared.",
      });
      // In a real app, notify backend
    }
  };
  
  const filteredInteractions = interactions.filter(interaction =>
    interaction.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (interaction.persona && interaction.persona.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Brain className="h-7 w-7" />
            Prabh's Unforgettable Memory
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            PrabhAI remembers past interactions to provide a more personalized experience. Review and manage remembered data here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search Prabh's memory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={handleClearMemory} variant="destructive" size="icon" aria-label="Clear memory">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground py-10">Prabh is accessing memories...</p>
          ) : (
            <ScrollArea className="h-[50vh] w-full rounded-md border p-4 bg-muted/20">
              {filteredInteractions.length > 0 ? (
                <div className="space-y-4">
                  {filteredInteractions.map(interaction => (
                    <div key={interaction.id} className={`flex ${interaction.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg shadow-md max-w-[75%] ${interaction.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border border-border'}`}>
                        <p className="text-sm">{interaction.text}</p>
                        <div className="text-xs opacity-70 mt-1 flex justify-between items-center">
                          <span>{new Date(interaction.timestamp).toLocaleString()}</span>
                          {interaction.persona && <Badge variant="outline" className="ml-2 text-xs border-accent text-accent">{interaction.persona}</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Prabh's memory banks are currently empty, or no interactions match your search.</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a chat to create some memories!</p>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Prabh's memory is currently stored locally in your browser. How cool is that?
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
