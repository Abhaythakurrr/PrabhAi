'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Shuffle, Send, Bot, UserCircle, CornerDownLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  persona?: string; // Persona AI used for this response
  timestamp: Date;
}

const initialPersonas = ["Friend", "Mentor", "Sarcastic Robot", "Shakespearean Poet", "Pirate Captain"];

export default function CanBeAnythingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState("Adaptive AI"); // Initial persona, will change
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addMessage = (text: string, sender: 'user' | 'ai', persona?: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender, persona, timestamp: new Date() }]);
  };
  
  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    const userMessage = currentInput;
    addMessage(userMessage, 'user');
    setCurrentInput("");
    setIsLoading(true);

    // Simulate AI adapting persona based on input
    // In a real app, an LLM would determine the best persona or generate a response that implies a persona shift.
    const newPersona = initialPersonas[Math.floor(Math.random() * initialPersonas.length)];
    setCurrentPersona(newPersona);
    
    try {
      // This is a MOCK call.
      const input: GeneratePersonalizedResponseInput = {
        userInput: userMessage,
        persona: newPersona, // The AI "chooses" a new persona
        pastInteractions: messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n') // Last 5 interactions
      };
      // const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      // addMessage(output.response, 'ai', newPersona);

      // Mocking the response
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      let aiResponseText = "";
      if (newPersona === "Friend") aiResponseText = `Hey there! So you said "${userMessage}". That's cool!`;
      else if (newPersona === "Mentor") aiResponseText = `Regarding your statement "${userMessage}", let's consider its implications...`;
      else if (newPersona === "Sarcastic Robot") aiResponseText = `Oh, joy. Another human utterance: "${userMessage}". I'll process that with my usual lack of enthusiasm.`;
      else if (newPersona === "Shakespearean Poet") aiResponseText = `Hark! Thy words, "${userMessage}", doth resonate within my circuits verily!`;
      else if (newPersona === "Pirate Captain") aiResponseText = `Arrr, ye say "${userMessage}"? Shiver me timbers, that be interestin'!`;
      else aiResponseText = `Okay, you mentioned "${userMessage}". I'm now responding as a ${newPersona}.`;
      
      addMessage(aiResponseText, 'ai', newPersona);

    } catch (error) {
      console.error("Error generating adaptive response:", error);
      addMessage("Apologies, I encountered a hiccup and couldn't quite adapt my response. Please try again.", 'ai', "System");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <Card className="shadow-xl flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shuffle className="h-6 w-6 text-primary" />
            Can Be Anything Mode
          </CardTitle>
          <CardDescription>
            Interact with PrabhAI and watch its persona adapt based on the conversation.
            Current AI Persona: <Badge variant="secondary" className="ml-1">{currentPersona}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <Bot className="h-8 w-8 text-primary self-start flex-shrink-0" />}
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === 'ai' && msg.persona && (
                      <Badge variant="outline" className="mt-1 text-xs">{msg.persona}</Badge>
                    )}
                     <p className="text-xs opacity-60 mt-1 text-right">{msg.timestamp.toLocaleTimeString()}</p>
                  </div>
                  {msg.sender === 'user' && <UserCircle className="h-8 w-8 text-muted-foreground self-start flex-shrink-0" />}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <Bot className="h-8 w-8 text-primary self-start flex-shrink-0" />
                  <div className="max-w-[70%] p-3 rounded-lg bg-card border">
                    <p className="text-sm animate-pulse">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message and see how AI adapts..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
              aria-label="Chat input"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !currentInput.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
       <p className="text-xs text-muted-foreground text-center w-full mt-2">
            Persona adaptation is simulated. True "Can Be Anything" mode requires advanced LLM capabilities.
        </p>
    </div>
  );
}
