
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Volume2, StopCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';
import { generateSpeech } from '@/services/tts-service';
import { useToast } from "@/hooks/use-toast";

// For STT - Check if window is defined for SpeechRecognition
const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
let recognitionInstance: SpeechRecognition | null = null;

// Initialize recognitionInstance only on the client-side after SpeechRecognitionAPI is confirmed
if (typeof window !== 'undefined' && SpeechRecognitionAPI) {
  recognitionInstance = new SpeechRecognitionAPI();
  recognitionInstance.continuous = false;
  recognitionInstance.lang = 'en-US';
  recognitionInstance.interimResults = false;
  recognitionInstance.maxAlternatives = 1;
}

export default function VoiceInteractionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPersona, setCurrentPersona] = useState("Friend"); // Default persona
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true); // Indicate client has mounted and browser APIs can be checked

    // Load persona from localStorage if available
    const savedPersonaId = localStorage.getItem('selectedPersonaId');
    const customName = localStorage.getItem('customPersonaName');
    if (savedPersonaId) {
        const personaMap: { [key: string]: string } = {
            friend: "Friend",
            mentor: "Mentor",
            assistant: "Professional Assistant",
            comedian: "Comedian",
            hacker: "Hacker",
            girlfriend: "Girlfriend",
            custom: customName || "Custom Persona"
        };
        setCurrentPersona(personaMap[savedPersonaId] || "Friend");
    }
  }, []);

  useEffect(() => {
    if (!clientReady || !recognitionInstance) return;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
      setIsRecording(false); 
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => { 
      let description = `Speech recognition error: ${event.error}. Maybe try typing?`;
      if (event.error === 'network') {
        description = "Prabh's having trouble reaching the speech service. Please check your internet connection and try again. You can also type your message.";
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        description = "Prabh can't access your microphone. Please check your browser's microphone permissions for this site. You can also type your message.";
      } else if (event.error === 'no-speech') {
        description = "Prabh didn't hear anything. Make sure your mic is working and try speaking again. Or, type your message!";
      } else if (event.error === 'audio-capture') {
        description = "Prabh couldn't capture audio. Is another app using your microphone? Try closing other apps or restarting your browser. You can also type!";
      }
      
      toast({
        variant: "destructive",
        title: "Prabh's Ears Are Acting Up!",
        description: description,
      });
      setIsRecording(false);
    };
    
    recognitionInstance.onend = () => {
        setIsRecording(false);
    };

    return () => {
      if (recognitionInstance) {
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        recognitionInstance.onend = null;
        if (isRecording) {
            recognitionInstance.stop();
        }
      }
    };
  }, [clientReady, toast, isRecording]); 


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoadingAiResponse || isLoadingTts) {
      setProgress(0);
      let currentProgress = 0;
      const increment = isLoadingAiResponse ? 10 : 20; 
      const interval = isLoadingAiResponse ? 200 : 100;
      timer = setInterval(() => {
        currentProgress += increment;
        if (currentProgress > 100) {
          setProgress(100); 
          clearInterval(timer);
        } else {
          setProgress(currentProgress);
        }
      }, interval);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoadingAiResponse, isLoadingTts]);

  const handleToggleRecording = () => {
    if (!clientReady || !recognitionInstance) {
       toast({
        variant: "destructive",
        title: "Mic Check Failed!",
        description: "Speech recognition is not supported or enabled in your browser, Prabh.",
      });
      return;
    }
    if (isRecording) {
      recognitionInstance.stop();
    } else {
      setTranscribedText(""); 
      setAiResponse(""); 
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      try {
        recognitionInstance.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({
            variant: "destructive",
            title: "Mic Busy!",
            description: "Prabh couldn't start listening. Is the mic already active or an issue with the speech service?"
        });
        setIsRecording(false);
      }
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => {
        console.error("Error playing audio:", e);
        toast({
          variant: "destructive",
          title: "Prabh's Voice Box Glitched!",
          description: "Couldn't play the audio. Check console for errors.",
        });
      });
    }
  };

  const handleSendText = async () => {
    if (!transcribedText.trim()) {
      toast({
        title: "Speak Up, Prabh Can't Hear Silence!",
        description: "Please say something or type a message.",
      });
      return;
    }
    setIsLoadingAiResponse(true);
    setAiResponse("");
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    
    try {
      const input: GeneratePersonalizedResponseInput = {
        userInput: transcribedText,
        persona: currentPersona,
        pastInteractions: "User is interacting via voice/text." ,
        currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      setAiResponse(output.response);
      setIsLoadingAiResponse(false);

      if (output.response) {
        setIsLoadingTts(true);
        const speechResult = await generateSpeech(output.response);
        setIsLoadingTts(false);
        if (speechResult.audioUrl) {
          playAudio(speechResult.audioUrl);
        } else {
          toast({
            variant: "destructive",
            title: "Prabh's Voice Generation Failed",
            description: speechResult.error || "Could not generate audio for the response.",
          });
        }
      }
    } catch (error) {
      console.error("Error in AI interaction pipeline:", error);
      setAiResponse("Oops! Prabh's circuits got a bit tangled. Try again, will you?");
      toast({
        variant: "destructive",
        title: "Prabh Stumbled!",
        description: "There was an error processing your request. Give it another shot!",
      });
      setIsLoadingAiResponse(false);
      setIsLoadingTts(false);
    }
  };

  const canRecord = clientReady && !!SpeechRecognitionAPI; 
  const buttonDisabled = isRecording ? false : (!canRecord || isLoadingAiResponse || isLoadingTts);
  const buttonText = isRecording 
    ? "Prabh is Listening..." 
    : (canRecord ? "Tap to Speak" : "Voice Not Supported");

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Mic className="h-7 w-7" />
            Talk to Prabh
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Speak or type, and Prabh will respond as your <span className="font-semibold text-accent">{currentPersona}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleToggleRecording}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="w-full max-w-xs rounded-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow disabled:opacity-70"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              disabled={buttonDisabled}
            >
              {isRecording ? (
                <StopCircle className="mr-2 h-6 w-6" />
              ) : (
                <Mic className="mr-2 h-6 w-6" />
              )}
              {buttonText}
            </Button>
            {isRecording && clientReady && ( 
              <p className="text-sm text-accent animate-pulse">Listening intently...</p>
            )}
          </div>

          <Textarea
            placeholder="Prabh will write down what you say, or you can type here..."
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            rows={3}
            className="text-base bg-background text-foreground placeholder:text-muted-foreground"
            disabled={isRecording || isLoadingAiResponse || isLoadingTts}
          />
          
          <Button 
            onClick={handleSendText} 
            disabled={isLoadingAiResponse || isLoadingTts || !transcribedText.trim()} 
            className="w-full text-lg py-3"
            aria-label="Send message to PrabhAI"
          >
            {(isLoadingAiResponse || isLoadingTts) ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {isLoadingAiResponse ? "Prabh is Thinking..." : (isLoadingTts ? "Prabh is Speaking..." : "Send to Prabh")}
          </Button>

          {(isLoadingAiResponse || isLoadingTts) && <Progress value={progress} className="w-full h-2" />}

          {aiResponse && !isLoadingAiResponse && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-accent">
                  <Volume2 className="h-5 w-5" />
                  Prabh Says:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{aiResponse}</p>
                <audio ref={audioRef} className="w-full mt-4" controls />
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Prabh uses browser STT & ElevenLabs TTS. Ensure your mic is enabled!
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

