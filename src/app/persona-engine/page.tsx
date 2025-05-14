'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, Save, Edit3, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock AI flow for personalized response based on persona
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';


const availablePersonas = [
  { id: "friend", name: "Friend", description: "A casual, supportive, and friendly companion." },
  { id: "mentor", name: "Mentor", description: "Provides guidance, advice, and encouragement." },
  { id: "assistant", name: "Professional Assistant", description: "Formal, efficient, and task-oriented." },
  { id: "comedian", name: "Comedian", description: "Tells jokes, light-hearted, and humorous." },
];

export default function PersonaEnginePage() {
  const [selectedPersonaId, setSelectedPersonaId] = useState(availablePersonas[0].id);
  const [customPersonaName, setCustomPersonaName] = useState("");
  const [customPersonaDescription, setCustomPersonaDescription] = useState("");
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exampleInteraction, setExampleInteraction] = useState("");

  const { toast } = useToast();

  const currentPersona = availablePersonas.find(p => p.id === selectedPersonaId) || 
                         (isEditingCustom && { id: 'custom', name: customPersonaName || "Custom Persona", description: customPersonaDescription });


  const handleSavePersona = () => {
    setIsLoading(true);
    // Simulate saving to backend/localStorage
    setTimeout(() => {
      localStorage.setItem('selectedPersonaId', selectedPersonaId);
      if (selectedPersonaId === 'custom') {
        localStorage.setItem('customPersonaName', customPersonaName);
        localStorage.setItem('customPersonaDescription', customPersonaDescription);
      }
      toast({
        title: "Persona Saved!",
        description: `Your AI will now respond as a ${currentPersona?.name}.`,
        action: <CheckCircle className="text-green-500" />,
      });
      setIsLoading(false);
      setIsEditingCustom(false); // Exit edit mode for custom persona if it was saved
    }, 1000);
  };

  useEffect(() => {
    const savedPersonaId = localStorage.getItem('selectedPersonaId');
    if (savedPersonaId) {
      setSelectedPersonaId(savedPersonaId);
      if (savedPersonaId === 'custom') {
        setCustomPersonaName(localStorage.getItem('customPersonaName') || "My Custom Persona");
        setCustomPersonaDescription(localStorage.getItem('customPersonaDescription') || "A unique persona tailored by me.");
      }
    }
  }, []);
  
  const handleTestPersona = async () => {
    if (!currentPersona) return;
    setIsLoading(true);
    setExampleInteraction("Generating example...");
    try {
      // This is a MOCK call using an existing flow for demonstration
      const input: GeneratePersonalizedResponseInput = {
        userInput: "Tell me something interesting.",
        persona: currentPersona.name,
        pastInteractions: "User is exploring persona settings." 
      };
      // const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      // setExampleInteraction(output.response);
      
      // Mocking the response
      await new Promise(resolve => setTimeout(resolve, 1500));
      setExampleInteraction(`As your ${currentPersona.name}, I'd say that the sky is vast and full of wonders! Did you know a flock of crows is called a murder?`);

    } catch (error) {
      console.error("Error testing persona:", error);
      setExampleInteraction("Sorry, couldn't generate an example response right now.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Persona Engine
          </CardTitle>
          <CardDescription>
            Select or create a persona for PrabhAI to tailor its responses and interaction style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="persona-select" className="text-lg">Select a Persona</Label>
            <Select value={selectedPersonaId} onValueChange={(value) => {
              setSelectedPersonaId(value);
              setIsEditingCustom(value === 'custom');
              if (value !== 'custom') setExampleInteraction(""); // Clear example when changing to preset
            }}>
              <SelectTrigger id="persona-select" className="w-full mt-1">
                <SelectValue placeholder="Choose a persona..." />
              </SelectTrigger>
              <SelectContent>
                {availablePersonas.map(persona => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name} - <span className="text-xs text-muted-foreground">{persona.description}</span>
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <Edit3 className="inline-block mr-2 h-4 w-4" /> Create Custom Persona
                </SelectItem>
              </SelectContent>
            </Select>
            {currentPersona && selectedPersonaId !== 'custom' && (
              <p className="mt-2 text-sm text-muted-foreground">{currentPersona.description}</p>
            )}
          </div>

          {selectedPersonaId === 'custom' && (
            <Card className="p-4 border-dashed border-primary/50">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-xl">Custom Persona Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <Label htmlFor="custom-name">Persona Name</Label>
                  <Input
                    id="custom-name"
                    value={customPersonaName}
                    onChange={(e) => setCustomPersonaName(e.target.value)}
                    placeholder="e.g., Sarcastic Robot"
                    disabled={!isEditingCustom && !!customPersonaName}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-description">Persona Description (how it should behave)</Label>
                  <Input
                    id="custom-description"
                    value={customPersonaDescription}
                    onChange={(e) => setCustomPersonaDescription(e.target.value)}
                    placeholder="e.g., Always responds with witty sarcasm but is secretly helpful."
                    disabled={!isEditingCustom && !!customPersonaDescription}
                  />
                </div>
                {!isEditingCustom && customPersonaName && (
                  <Button variant="outline" onClick={() => setIsEditingCustom(true)} className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Custom Persona
                  </Button>
                )}
                 {isEditingCustom && (
                  <Button onClick={() => { handleSavePersona();}} className="w-full" disabled={isLoading || !customPersonaName || !customPersonaDescription}>
                    <Save className="mr-2 h-4 w-4" /> Save Custom Persona
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          <Button onClick={handleSavePersona} className="w-full" disabled={isLoading || (selectedPersonaId === 'custom' && !customPersonaName)}>
            <Save className="mr-2 h-4 w-4" /> 
            {isLoading ? "Saving..." : "Set Current Persona"}
          </Button>

          {currentPersona && (
             <div className="mt-6">
              <Button variant="secondary" onClick={handleTestPersona} className="w-full" disabled={isLoading}>
                Test Persona: {currentPersona.name}
              </Button>
              {exampleInteraction && (
                <Card className="mt-4 bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-md">Example Interaction:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>You:</strong> Tell me something interesting.</p>
                    <p className="text-sm mt-1"><strong>{currentPersona.name}:</strong> {exampleInteraction}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Persona preferences are saved locally in your browser.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
