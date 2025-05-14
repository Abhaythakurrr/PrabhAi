
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shuffle, Send, Bot, UserCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  persona?: string;
  timestamp: Date;
}

interface StoredInteraction {
  id: string;
  timestamp: string;
  type: 'user' | 'ai';
  text: string;
  persona?: string;
}

const initialPersonas = ["Friend", "Mentor", "Sarcastic Robot", "Shakespearean Poet", "Pirate Captain", "Cosmic Entity", "Helpful Coder"];
const TYPING_SPEED_MS_PER_CHUNK = 75;
const MEMORY_KEY = 'prabhAiMemory';

export default function CanBeAnythingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState("Adaptive AI");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const saveInteractionToMemory = (message: ChatMessage, persona?: string) => {
    try {
      const currentMemoryString = localStorage.getItem(MEMORY_KEY);
      let currentMemory: StoredInteraction[] = [];
      if (currentMemoryString) {
        currentMemory = JSON.parse(currentMemoryString);
      }
      const newInteraction: StoredInteraction = {
        id: message.id,
        timestamp: message.timestamp.toISOString(),
        type: message.sender,
        text: message.text,
        persona: message.sender === 'ai' ? persona : undefined,
      };
      currentMemory.push(newInteraction);
      localStorage.setItem(MEMORY_KEY, JSON.stringify(currentMemory));
    } catch (error) {
      console.error("Error saving interaction to memory:", error);
      toast({
        variant: "destructive",
        title: "Memory Glitch!",
        description: "Prabh had trouble remembering that last bit.",
      });
    }
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = { 
      id: Date.now().toString() + '_user', 
      text, 
      sender: 'user', 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, newMessage]);
    saveInteractionToMemory(newMessage);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    const userMessageText = currentInput;
    addUserMessage(userMessageText); // This already saves user message
    setCurrentInput("");
    setIsLoading(true);

    const newPersonaForCall = initialPersonas[Math.floor(Math.random() * initialPersonas.length)];
    setCurrentPersona(newPersonaForCall); 
    
    try {
      const input: GeneratePersonalizedResponseInput = {
        userInput: userMessageText,
        persona: newPersonaForCall, 
        pastInteractions: messages.slice(-5).map(m => `${m.sender === 'user' ? 'User' : `Prabh (${m.persona || 'AI'})`}: ${m.text}`).join('\n')
      };
      const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      
      const aiFullResponse = output.response;
      const aiMessageId = Date.now().toString() + "_ai";
      const aiMessageTimestamp = new Date();


      setMessages(prev => [...prev, { 
        id: aiMessageId, 
        text: "", 
        sender: 'ai', 
        persona: newPersonaForCall, 
        timestamp: aiMessageTimestamp
      }]);
      setIsLoading(false); 

      const chunks = aiFullResponse.split(/(\s+)/);
      let builtResponse = "";
      for (const chunk of chunks) {
        if (!chunk) continue;
        builtResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: builtResponse } : msg
          )
        );
        scrollToBottom();
        await new Promise(resolve => setTimeout(resolve, TYPING_SPEED_MS_PER_CHUNK / (chunk.length > 5 ? 2: 1)));
      }
      // Save full AI message after typing animation
      saveInteractionToMemory({ id: aiMessageId, text: aiFullResponse, sender: 'ai', timestamp: aiMessageTimestamp, persona: newPersonaForCall }, newPersonaForCall);

    } catch (error: any) {
      setIsLoading(false);
      console.error("Error generating adaptive response from Prabh:", error);
      const errorTimestamp = new Date();
      const errorMessage: ChatMessage = { 
        id: Date.now().toString() + '_ai_error', 
        text: "Prabh's feeling a bit indecisive right now and couldn't adapt. Try again?", 
        sender: 'ai', 
        persona: "System Error", 
        timestamp: errorTimestamp
      };
      setMessages(prev => [...prev, errorMessage]);
      saveInteractionToMemory(errorMessage, "System Error");
      toast({
        variant: "destructive",
        title: "Prabh's Persona Glitch!",
        description: "Could not get an adaptive response. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col flex-1">
      <Card className="shadow-xl flex-1 flex flex-col bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Shuffle className="h-7 w-7" />
            Prabh Can Be Anything!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Watch Prabh's persona shift with each interaction. Currently: <Badge variant="secondary" className="ml-1 bg-accent text-accent-foreground">{currentPersona}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <Bot className="h-8 w-8 text-primary self-start flex-shrink-0" />}
                  <div className={`max-w-[75%] p-3 rounded-xl shadow-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-foreground border border-border'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text || (msg.sender === 'ai' ? "..." : "")}</p>
                    {msg.sender === 'ai' && msg.persona && (
                      <Badge variant="outline" className="mt-2 text-xs border-accent text-accent">{msg.persona}</Badge>
                    )}
                     <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {msg.sender === 'user' && <UserCircle className="h-8 w-8 text-secondary self-start flex-shrink-0" />}
                </div>
              ))}
              {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && ( 
                <div className="flex items-end gap-2">
                  <Bot className="h-8 w-8 text-primary self-start flex-shrink-0" />
                  <div className="max-w-[70%] p-3 rounded-xl bg-muted/30 border border-border">
                    <p className="text-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-accent"/> Prabh is adapting...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t border-border">
          <div className="flex w-full items-center gap-2">
            <Input
              type="text"
              placeholder="Chat with Prabh and see the magic..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 bg-background text-foreground placeholder:text-muted-foreground"
              aria-label="Chat input"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !currentInput.trim()} aria-label="Send message" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
       <p className="text-xs text-muted-foreground text-center w-full mt-2">
            Prabh's persona adaptation is AI-driven. How cool is that?!
        </p>
    </div>
  );
}
