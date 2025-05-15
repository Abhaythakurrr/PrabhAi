
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Volume2, StopCircle, Loader2, Phone, PhoneOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';
import { generateSpeech } from '@/services/tts-service';
import { useToast } from "@/hooks/use-toast";

const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
let recognitionInstance: SpeechRecognition | null = null;

if (typeof window !== 'undefined' && SpeechRecognitionAPI) {
  recognitionInstance = new SpeechRecognitionAPI();
  recognitionInstance.continuous = false;
  recognitionInstance.lang = 'en-US';
  recognitionInstance.interimResults = false;
  recognitionInstance.maxAlternatives = 1;
}

type CallState = 'idle' | 'active';

export default function VoiceInteractionPage() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPersona, setCurrentPersona] = useState("Friend");
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [clientReady, setClientReady] = useState(false);
  const previousIsRecording = useRef(false);

  useEffect(() => {
    setClientReady(true);
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
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing audio:", error);
          toast({
            variant: "destructive",
            title: "Audio Playback Error",
            description: "Prabh tried to speak, but the audio couldn't play.",
          });
        });
      }
    }
  }, [currentAudioUrl, toast]);

  const handleSendText = useCallback(async () => {
    if (!transcribedText.trim()) {
      toast({
        title: "Speak Up, Prabh Can't Hear Silence!",
        description: "Please say something or type a message.",
      });
      return;
    }
    setIsLoadingAiResponse(true);
    setAiResponse("");
    setCurrentAudioUrl(null);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Clear src to avoid re-playing old audio
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
          setCurrentAudioUrl(speechResult.audioUrl);
        } else {
          setCurrentAudioUrl(null);
          toast({
            variant: "destructive",
            title: "Prabh's Voice Generation Failed",
            description: speechResult.error || "Could not generate audio for the response.",
          });
        }
      }
    } catch (error: any) {
      console.error("Error in AI interaction pipeline:", error);
      setAiResponse("Oops! Prabh's circuits got a bit tangled. Try again, will you?");
      setCurrentAudioUrl(null);
      toast({
        variant: "destructive",
        title: "Prabh Stumbled!",
        description: "There was an error processing your request. Give it another shot!",
      });
      setIsLoadingAiResponse(false);
      setIsLoadingTts(false);
    }
  }, [transcribedText, currentPersona, toast]);

  useEffect(() => {
    if (!clientReady || !recognitionInstance) return;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
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
        if (isRecording && callState === 'active') { 
            recognitionInstance.stop();
        }
      }
    };
  }, [clientReady, toast, isRecording, callState]); 

  useEffect(() => {
    if (callState === 'active' && previousIsRecording.current && !isRecording && transcribedText.trim()) {
      handleSendText();
    }
    previousIsRecording.current = isRecording;
  }, [isRecording, transcribedText, handleSendText, callState]);

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
    if (!clientReady || !recognitionInstance || callState !== 'active') {
       toast({
        variant: "destructive",
        title: "Mic Check Failed!",
        description: "Speech recognition is not supported, enabled, or call is not active, Prabh.",
      });
      return;
    }
    if (isRecording) {
      recognitionInstance.stop();
      setIsRecording(false); 
    } else {
      setTranscribedText(""); 
      setAiResponse(""); 
      setCurrentAudioUrl(null);
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
  
  const handleStartCall = () => {
    setTranscribedText("");
    setAiResponse("");
    setCurrentAudioUrl(null);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    setCallState('active');
    // Optionally, trigger an initial greeting from Prabh here
    // e.g., setTranscribedText("Hello Prabh, start call."); handleSendText();
    // For now, let's keep it simple: user initiates first speech after call starts.
     toast({
        title: "Call Started!",
        description: "You're now connected to Prabh. Tap the mic to speak.",
      });
  };

  const handleEndCall = () => {
    if (isRecording && recognitionInstance) {
      recognitionInstance.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsRecording(false);
    setIsLoadingAiResponse(false);
    setIsLoadingTts(false);
    setCurrentAudioUrl(null);
    setTranscribedText("");
    setAiResponse("");
    setCallState('idle');
    toast({
        title: "Call Ended",
        description: "Your conversation with Prabh has ended.",
      });
  };
  
  const canRecord = clientReady && !!SpeechRecognitionAPI && callState === 'active'; 
  const recordButtonDisabled = isLoadingAiResponse || isLoadingTts || (!isRecording && !canRecord);
  const recordButtonText = isRecording 
    ? "Prabh is Listening..." 
    : (canRecord ? "Tap to Speak" : (callState === 'active' ? "Voice Not Supported" : "Start Call to Speak"));

  return (
    <div className="container mx-auto py-8 flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-2xl shadow-xl bg-card flex flex-col flex-1">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Phone className="h-7 w-7" />
            Call Prabh
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {callState === 'idle' 
              ? "Ready to talk? Start a real-time voice call with Prabh."
              : `Talking with Prabh as your ${currentPersona}.`}
          </CardDescription>
        </CardHeader>

        {callState === 'idle' && (
          <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
            <Phone className="h-24 w-24 text-primary opacity-50" />
            <Button
              onClick={handleStartCall}
              size="lg"
              className="w-full max-w-xs rounded-full text-xl py-8 shadow-lg hover:shadow-2xl transition-shadow bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Phone className="mr-3 h-7 w-7" />
              Start Call with Prabh
            </Button>
             <p className="text-sm text-muted-foreground text-center">
              Click the button above to begin a live voice conversation.
            </p>
          </CardContent>
        )}

        {callState === 'active' && (
          <>
            <CardContent className="flex-1 space-y-6 p-4 overflow-y-auto">
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleToggleRecording}
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full max-w-xs rounded-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow disabled:opacity-70"
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                  disabled={recordButtonDisabled}
                >
                  {isRecording ? (
                    <StopCircle className="mr-2 h-6 w-6 animate-pulse" />
                  ) : (
                    <Mic className="mr-2 h-6 w-6" />
                  )}
                  {recordButtonText}
                </Button>
                {isRecording && clientReady && ( 
                  <p className="text-sm text-accent animate-pulse">Listening intently...</p>
                )}
              </div>

              <Textarea
                placeholder="Prabh will write down what you say..."
                value={transcribedText}
                readOnly // User input is primarily via voice in call mode
                rows={3}
                className="text-base bg-background/30 text-foreground placeholder:text-muted-foreground border-border/50"
              />
              
              {(isLoadingAiResponse || isLoadingTts) && <Progress value={progress} className="w-full h-2 mt-2" />}

              {aiResponse && !isLoadingAiResponse && (
                <Card className="bg-muted/30 mt-4">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-md flex items-center gap-2 text-accent">
                      <Volume2 className="h-5 w-5" />
                      Prabh Says:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-foreground whitespace-pre-wrap">{aiResponse}</p>
                    {currentAudioUrl && <audio ref={audioRef} className="w-full mt-4" controls />}
                  </CardContent>
                </Card>
              )}
               {!aiResponse && !isLoadingAiResponse && !isLoadingTts && transcribedText && (
                 <p className="text-sm text-muted-foreground text-center py-4">Prabh is processing your message...</p>
               )}
               {!aiResponse && !isLoadingAiResponse && !isLoadingTts && !transcribedText && (
                 <p className="text-sm text-muted-foreground text-center py-4">Tap the mic to speak to Prabh.</p>
               )}
            </CardContent>
            <CardFooter className="p-4 border-t border-border">
              <Button 
                onClick={handleEndCall} 
                variant="destructive" 
                className="w-full text-lg py-3"
                aria-label="End call with PrabhAI"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                End Call
              </Button>
            </CardFooter>
          </>
        )}
         {callState !== 'active' && (
          <CardFooter className="p-4 border-t border-border">
             <p className="text-xs text-muted-foreground text-center w-full">
                Prabh uses browser STT & ElevenLabs TTS. Ensure your mic is enabled!
            </p>
          </CardFooter>
         )}
      </Card>
    </div>
  );
}
