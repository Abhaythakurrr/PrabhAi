'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, Save, Edit3, CheckCircle, Wand2, Loader2 } from "lucide-react"; // Added Wand2 and Loader2
import { useToast } from "@/hooks/use-toast";
import { generatePersonalizedResponse, type GeneratePersonalizedResponseInput, type GeneratePersonalizedResponseOutput } from '@/ai/flows/generate-personalized-response';

interface PersonaOption {
  id: string;
  name: string;
  description: string;
}

const availablePersonas: PersonaOption[] = [
  { id: "friend", name: "Friend", description: "Prabh as your chill, supportive buddy." },
  { id: "mentor", name: "Mentor", description: "Prabh offering wisdom, guidance, and encouragement." },
  { id: "assistant", name: "Professional Assistant", description: "Prabh, formal, efficient, and laser-focused on tasks." },
  { id: "comedian", name: "Comedian", description: "Prabh cracking jokes, keeping it light and funny." },
  { id: "hacker", name: "Hacker", description: "Prabh with a techy, code-savvy, and slightly mischievous vibe." },
  { id: "girlfriend", name: "Girlfriend", description: "Prabh as an affectionate, caring, and playful partner."}
];

export default function PersonaEnginePage() {
  const [selectedPersonaId, setSelectedPersonaId] = useState(availablePersonas[0].id);
  const [customPersonaName, setCustomPersonaName] = useState("");
  const [customPersonaDescription, setCustomPersonaDescription] = useState("");
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [exampleInteraction, setExampleInteraction] = useState("");

  const { toast } = useToast();

  const currentSelectedPersonaDetails = availablePersonas.find(p => p.id === selectedPersonaId);
  
  // This is the persona object that will be used for API calls and display
  const [activePersona, setActivePersona] = useState<PersonaOption>(currentSelectedPersonaDetails || availablePersonas[0]);

  useEffect(() => {
    const savedPersonaId = localStorage.getItem('selectedPersonaId');
    const savedCustomName = localStorage.getItem('customPersonaName');
    const savedCustomDesc = localStorage.getItem('customPersonaDescription');

    if (savedPersonaId) {
      setSelectedPersonaId(savedPersonaId);
      if (savedPersonaId === 'custom') {
        const name = savedCustomName || "My Custom Prabh";
        const desc = savedCustomDesc || "A unique persona for Prabh, crafted by me.";
        setCustomPersonaName(name);
        setCustomPersonaDescription(desc);
        setActivePersona({ id: 'custom', name, description: desc });
        setIsEditingCustom(false); // Start in non-edit mode if loaded
      } else {
        setActivePersona(availablePersonas.find(p => p.id === savedPersonaId) || availablePersonas[0]);
      }
    } else {
      setActivePersona(availablePersonas[0]);
    }
  }, []);
  
  useEffect(() => {
    // Update activePersona when selection changes or custom details change
    if (selectedPersonaId === 'custom') {
      setActivePersona({ id: 'custom', name: customPersonaName || "Custom Prabh", description: customPersonaDescription });
    } else {
      setActivePersona(availablePersonas.find(p => p.id === selectedPersonaId) || availablePersonas[0]);
    }
    setExampleInteraction(""); // Clear example when persona potentially changes
  }, [selectedPersonaId, customPersonaName, customPersonaDescription]);


  const handleSavePersona = () => {
    setIsSaving(true);
    
    localStorage.setItem('selectedPersonaId', selectedPersonaId);
    let finalPersonaName = activePersona.name;

    if (selectedPersonaId === 'custom') {
      if (!customPersonaName.trim() || !customPersonaDescription.trim()) {
        toast({
          variant: "destructive",
          title: "Hold Up, Creator!",
          description: "Prabh needs a name and description for this custom persona.",
        });
        setIsSaving(false);
        return;
      }
      localStorage.setItem('customPersonaName', customPersonaName);
      localStorage.setItem('customPersonaDescription', customPersonaDescription);
      finalPersonaName = customPersonaName; // Use the state value which should be up-to-date
    }
    
    // Simulate saving to backend/localStorage
    setTimeout(() => { // Keep timeout for UX feel
      toast({
        title: "Prabh's Persona Updated!",
        description: `Prabh is now channelling: ${finalPersonaName}.`,
        action: <CheckCircle className="text-green-500" />,
      });
      setIsSaving(false);
      if (selectedPersonaId === 'custom') setIsEditingCustom(false); 
    }, 700);
  };
  
  const handleTestPersona = async () => {
    if (!activePersona) return;
    setIsTesting(true);
    setExampleInteraction(""); // Clear previous
    try {
      const input: GeneratePersonalizedResponseInput = {
        userInput: "Hey Prabh, tell me a fun fact about yourself in this persona!",
        persona: activePersona.name, // Use the name of the active persona
        pastInteractions: "User is testing persona settings." 
      };
      const output: GeneratePersonalizedResponseOutput = await generatePersonalizedResponse(input);
      setExampleInteraction(output.response);
    } catch (error) {
      console.error("Error testing Prabh's persona:", error);
      setExampleInteraction("Prabh's a bit shy in this persona right now. Couldn't generate an example.");
      toast({
        variant: "destructive",
        title: "Prabh's Test Drive Failed!",
        description: "Could not get an example response. Try again?",
      });
    } finally {
      setIsTesting(false);
    }
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Users className="h-7 w-7" />
            Prabh's Persona Engine
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose how Prabh interacts. Current Persona: <strong className="text-accent">{activePersona.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="persona-select" className="text-lg font-medium text-foreground">Select Base Persona</Label>
            <Select 
              value={selectedPersonaId} 
              onValueChange={(value) => {
                setSelectedPersonaId(value);
                setIsEditingCustom(value === 'custom');
                 if (value === 'custom' && !customPersonaName) { // If switching to custom and it's blank, enable editing
                    setIsEditingCustom(true);
                }
              }}
            >
              <SelectTrigger id="persona-select" className="w-full mt-1 bg-background text-foreground">
                <SelectValue placeholder="Choose how Prabh should be..." />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {availablePersonas.map(persona => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name} - <span className="text-xs text-muted-foreground">{persona.description}</span>
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <Edit3 className="inline-block mr-2 h-4 w-4 text-accent" /> Create Your Own Prabh
                </SelectItem>
              </SelectContent>
            </Select>
            {activePersona && selectedPersonaId !== 'custom' && (
              <p className="mt-2 text-sm text-muted-foreground">{activePersona.description}</p>
            )}
          </div>

          {selectedPersonaId === 'custom' && (
            <Card className="p-4 border-dashed border-primary/50 bg-muted/20">
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl text-primary">Craft Custom Prabh</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <Label htmlFor="custom-name" className="text-foreground">Prabh's Custom Name</Label>
                  <Input
                    id="custom-name"
                    value={customPersonaName}
                    onChange={(e) => setCustomPersonaName(e.target.value)}
                    placeholder="e.g., Galactic Sage Prabh"
                    disabled={!isEditingCustom && !!customPersonaName}
                    className="bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-description" className="text-foreground">How should this Prabh behave?</Label>
                  <Input
                    id="custom-description"
                    value={customPersonaDescription}
                    onChange={(e) => setCustomPersonaDescription(e.target.value)}
                    placeholder="e.g., Wise, speaks in riddles, loves talking about stars."
                    disabled={!isEditingCustom && !!customPersonaDescription}
                    className="bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {!isEditingCustom && customPersonaName ? (
                  <Button variant="outline" onClick={() => setIsEditingCustom(true)} className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" /> Modify Custom Prabh
                  </Button>
                ) : isEditingCustom ? (
                  <Button onClick={handleSavePersona} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" disabled={isSaving || !customPersonaName || !customPersonaDescription}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? "Saving Custom Prabh..." : "Save Custom Prabh"}
                  </Button>
                ) : null }
              </CardContent>
            </Card>
          )}
          
          <Button onClick={handleSavePersona} className="w-full text-lg py-3" disabled={isSaving || (selectedPersonaId === 'custom' && (!customPersonaName.trim() || !customPersonaDescription.trim() || !isEditingCustom))}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? "Prabh is Adapting..." : "Set Current Persona for Prabh"}
          </Button>

          {activePersona && (
             <div className="mt-6">
              <Button variant="secondary" onClick={handleTestPersona} className="w-full" disabled={isTesting || isSaving}>
                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                {isTesting ? "Prabh is Responding..." : `Test Drive: ${activePersona.name}`}
              </Button>
              {exampleInteraction && (
                <Card className="mt-4 bg-muted/30">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-md text-primary">Prabh's Example Interaction:</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground"><strong>You:</strong> Hey Prabh, tell me a fun fact about yourself in this persona!</p>
                    <p className="text-sm mt-2 text-foreground"><strong>{activePersona.name}:</strong> {exampleInteraction}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Prabh's persona settings are saved in your browser. Cool, right?
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
