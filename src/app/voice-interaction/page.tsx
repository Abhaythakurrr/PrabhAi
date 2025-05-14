'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Volume2, StopCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock AI flow. In a real app, this would call your GenAI backend.
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';


export default function VoiceInteractionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPersona, setCurrentPersona] = useState("Friend"); // Default persona

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress += 10;
        if (currentProgress > 100) {
          clearInterval(timer);
        } else {
          setProgress(currentProgress);
        }
      }, 200);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice input being processed
      setTranscribedText("User said: Hello PrabhAI, how are you today?");
    } else {
      setTranscribedText("");
    }
  };

  const handleSendText = async () => {
    if (!transcribedText) return;
    setIsLoading(true);
    setAiResponse("");
    
    // Simulate API call delay and response
    try {
      // This is a MOCK call using an existing flow for demonstration
      // In a real app, you'd integrate with your actual voice LLM flow.
      const input: GeneratePersonalizedResponseInput = {
        userInput: transcribedText,
        persona: currentPersona,
        pastInteractions: "User previously asked about weather. User prefers concise answers." 
      };
      // const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      // setAiResponse(output.response);
      
      // Mocking the response for now as Genkit flow might not be fully set up for client direct call.
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      setAiResponse(`As your ${currentPersona}, I'm doing great! Thanks for asking. You said: "${transcribedText}"`);

    } catch (error) {
      console.error("Error generating response:", error);
      setAiResponse("Sorry, I couldn't process that. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            Voice Interaction
          </CardTitle>
          <CardDescription>
            Speak to PrabhAI or type your message. The AI will respond using the selected persona.
            (Currently set to: <span className="font-semibold text-primary">{currentPersona}</span>)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleToggleRecording}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="w-full max-w-xs rounded-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <StopCircle className="mr-2 h-6 w-6" />
              ) : (
                <Mic className="mr-2 h-6 w-6" />
              )}
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            {isRecording && (
              <p className="text-sm text-muted-foreground animate-pulse">Listening...</p>
            )}
          </div>

          <Textarea
            placeholder="Your transcribed text will appear here, or type your message..."
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            rows={3}
            className="text-base"
          />
          
          <Button onClick={handleSendText} disabled={isLoading || !transcribedText} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? "Thinking..." : "Send to PrabhAI"}
          </Button>

          {isLoading && <Progress value={progress} className="w-full" />}

          {aiResponse && (
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-accent" />
                  PrabhAI Says:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{aiResponse}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Voice processing and TTS are simulated. Real integration requires Whisper, Eden/OpenRouter, and ElevenLabs APIs.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
