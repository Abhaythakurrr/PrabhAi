
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button"; // Using PrabhButton
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';
import { useToast } from "@/hooks/use-toast";
import ChatBubble from '@/components/prabh_ui/ChatBubble'; // Import new ChatBubble
import { PrabhButton } from '@/components/prabh_ui/PrabhButton'; // Import new PrabhButton

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'prabh'; // Changed 'ai' to 'prabh' for consistency with ChatBubble prop
  timestamp: Date;
}

interface StoredInteraction {
  id: string;
  timestamp: string;
  type: 'user' | 'ai'; // Keeping 'ai' here for potential backward compatibility with existing memory
  text: string;
  persona?: string;
}

const NEUTRAL_PERSONA_NAME = "Prabh (Neutral)";
const TYPING_SPEED_MS_PER_CHUNK = 75; 
const MEMORY_KEY = 'prabhAiMemory';
const INITIAL_GREETING_ID = "prabh-initial-greeting";
const INITIAL_GREETING_TEXT = "Hi, I'm Prabh — an AI created by Abhay to power the Akshu Ecosystem. How can I help you today? ✨";

export default function PrabhChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    if (messages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: INITIAL_GREETING_ID,
        text: INITIAL_GREETING_TEXT,
        sender: 'prabh',
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      saveInteractionToMemory(greetingMessage, NEUTRAL_PERSONA_NAME);
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
        type: message.sender === 'prabh' ? 'ai' : 'user', // Map 'prabh' to 'ai' for storage
        text: message.text,
        persona: message.sender === 'prabh' ? persona || NEUTRAL_PERSONA_NAME : undefined,
      };
      if (message.id === INITIAL_GREETING_ID && currentMemory.some(m => m.id === INITIAL_GREETING_ID)) {
        return;
      }
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
    addUserMessage(userMessageText);
    setCurrentInput("");
    setIsLoading(true);
    
    try {
      const input: GeneratePersonalizedResponseInput = {
        userInput: userMessageText,
        persona: NEUTRAL_PERSONA_NAME, 
        pastInteractions: messages.slice(-5).map(m => `${m.sender === 'user' ? 'User' : `Prabh`}: ${m.text}`).join('\n'),
        currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      
      const aiFullResponse = output.response;
      const aiMessageId = Date.now().toString() + "_prabh"; // Changed suffix
      const aiMessageTimestamp = new Date();

      setMessages(prev => [...prev, { 
        id: aiMessageId, 
        text: "", 
        sender: 'prabh', 
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
        await new Promise(resolve => setTimeout(resolve, TYPING_SPEED_MS_PER_CHUNK / (chunk.length > 5 ? 2 : 1) )); 
      }
      saveInteractionToMemory({ id: aiMessageId, text: aiFullResponse, sender: 'prabh', timestamp: aiMessageTimestamp }, NEUTRAL_PERSONA_NAME);

    } catch (error: any) {
      setIsLoading(false);
      console.error("Error generating response from Prabh:", error);
      const errorTimestamp = new Date();
      const errorMessageText = (error.message && error.message.includes("All LLM providers failed")) 
        ? "Prabh's feeling a bit overwhelmed and couldn't connect to any thought streams. Maybe try again in a moment?"
        : "Prabh's feeling a bit quiet right now. Try again in a moment?";
      const errorMessage: ChatMessage = { 
        id: Date.now().toString() + '_prabh_error', // Changed suffix
        text: errorMessageText, 
        sender: 'prabh', 
        timestamp: errorTimestamp
      };
      setMessages(prev => [...prev, errorMessage]);
      saveInteractionToMemory(errorMessage, "System Error");
      toast({
        variant: "destructive",
        title: "Prabh's Connection Glitch!",
        description: "Could not get a response. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col flex-1">
      <Card className="shadow-card dark:shadow-dark_card flex-1 flex flex-col bg-prabh-surface dark:bg-dark_prabh-surface text-prabh-text dark:text-dark_prabh-text">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-prabh-primary dark:text-dark_prabh-primary">
            <MessageSquare className="h-7 w-7" />
            Chat with Prabh
          </CardTitle>
          <CardDescription className="text-prabh-muted dark:text-dark_prabh-muted">
            Interact with Prabh in a standard, helpful mode. Current Persona: <span className="font-semibold text-prabh-accent dark:text-dark_prabh-accent">{NEUTRAL_PERSONA_NAME}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-2"> {/* Reduced space between bubbles */}
              {messages.map((msg) => (
                <ChatBubble 
                  key={msg.id} 
                  from={msg.sender} 
                  text={msg.text || (msg.sender === 'prabh' ? "..." : "")}
                  timestamp={msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
              ))}
              {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && ( 
                <div className="flex justify-start mb-3">
                   <div className="flex items-end gap-2 max-w-[80%]">
                    <div className="px-4 py-3 rounded-xl text-sm font-body shadow-card bg-prabh-surface text-prabh-text border border-prabh-secondary dark:bg-dark_prabh-surface dark:text-dark_prabh-text dark:border-dark_prabh-secondary rounded-tl-none">
                        <p className="text-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-prabh-primary dark:text-dark_prabh-primary"/> Prabh is thinking...
                        </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t border-prabh-primary/20 dark:border-dark_prabh-primary/20">
          <div className="flex w-full items-center gap-2">
            <Input
              type="text"
              placeholder="Ask Prabh anything..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 bg-prabh-background dark:bg-dark_prabh-background text-prabh-text dark:text-dark_prabh-text placeholder:text-prabh-muted dark:placeholder:text-dark_prabh-muted border-prabh-secondary/50 dark:border-dark_prabh-secondary/50 focus:border-prabh-primary dark:focus:border-dark_prabh-primary focus:ring-prabh-primary dark:focus:ring-dark_prabh-primary"
              aria-label="Chat input"
            />
            <PrabhButton onClick={handleSendMessage} disabled={isLoading || !currentInput.trim()} aria-label="Send message">
              <Send className="h-5 w-5 mr-0 md:mr-2" /> <span className="hidden md:inline">Send</span>
            </PrabhButton>
          </div>
        </CardFooter>
      </Card>
       <p className="text-xs text-prabh-muted dark:text-dark_prabh-muted text-center w-full mt-2">
            Prabh is always learning. Responses are AI-generated.
        </p>
    </div>
  );
}
