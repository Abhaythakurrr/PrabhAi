
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Rocket, Lightbulb, Zap, Image as ImageIconLucide } from "lucide-react"; 
import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useState } from 'react';
import { generateImageFromDescription } from '@/ai/flows/generate-image-from-description';
import Hero from '@/components/prabh_ui/Hero'; 
import ThemeToggle from '@/components/prabh_ui/ThemeToggle'; 

export default function DashboardPage() {
  const [personalizedExperienceImgSrc, setPersonalizedExperienceImgSrc] = useState("https://placehold.co/600x400.png");
  const [powerfulFeaturesImgSrc, setPowerfulFeaturesImgSrc] = useState("https://placehold.co/600x400.png");
  const [personalizedExperienceError, setPersonalizedExperienceError] = useState<string | null>(null);
  const [powerfulFeaturesError, setPowerfulFeaturesError] = useState<string | null>(null);


  useEffect(() => {
    const fetchAiImage = async (
      hint: string, 
      setter: React.Dispatch<React.SetStateAction<string>>,
      errorSetter: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
      if (!hint) {
        errorSetter("No hint provided for image generation.");
        return;
      }
      errorSetter(null); // Clear previous error
      try {
        const output = await generateImageFromDescription({ description: hint });
        if (output.success && output.imageDataUri) {
          setter(output.imageDataUri);
        } else {
          console.warn(`Dashboard image generation for hint "${hint}" failed: ${output.errorMessage}`);
          errorSetter(output.errorMessage || "Failed to generate image.");
          // Keeps placeholder by not calling setter with new URL
        }
      } catch (error: any) {
        console.error(`Dashboard: Critical error generating image for hint "${hint}":`, error);
        errorSetter(`Image generation error: ${error.message || 'Unknown error'}`);
         // Keeps placeholder
      }
    };

    fetchAiImage("AI personalization abstract", setPersonalizedExperienceImgSrc, setPersonalizedExperienceError);
    fetchAiImage("AI capabilities network", setPowerfulFeaturesImgSrc, setPowerfulFeaturesError);
  }, []);

  const renderImageOrPlaceholder = (src: string, alt: string, hint: string, error: string | null) => {
    if (error || src === "https://placehold.co/600x400.png") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
          <ImageIconLucide className="h-16 w-16 text-muted-foreground" />
          {error && <p className="text-xs text-destructive mt-2 text-center p-1">{error.substring(0,100)}</p>}
        </div>
      );
    }
    return (
      <NextImage 
        src={src} 
        alt={alt}
        width={600} 
        height={400} 
        className="object-cover w-full h-full"
        data-ai-hint={hint}
        unoptimized={src.startsWith('data:')}
      />
    );
  };


  return (
    <div className="flex flex-col gap-0"> 
      <Hero /> 
      
      <div className="absolute top-4 right-16 z-50 hidden md:block">
        <ThemeToggle />
      </div>


      <header className="space-y-2 p-6 md:p-8"> 
        <h2 className="text-3xl font-headline tracking-tight md:text-4xl text-prabh-text dark:text-dark_prabh-text">
          Explore PrabhAI's Features
        </h2>
        <p className="text-lg text-prabh-muted dark:text-dark_prabh-muted">
          Discover what your intelligent companion can do.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6 md:p-8"> 
        <Card className="shadow-card dark:shadow-dark_card hover:shadow-xl transition-shadow duration-300 bg-prabh-surface dark:bg-dark_prabh-surface">
          <CardHeader>
            <Rocket className="h-8 w-8 text-prabh-primary dark:text-dark_prabh-primary mb-2" />
            <CardTitle className="text-prabh-text dark:text-dark_prabh-text">Get Started Quickly</CardTitle>
            <CardDescription className="text-prabh-muted dark:text-dark_prabh-muted">Jump right into interacting or creating with PrabhAI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-prabh-text dark:text-dark_prabh-text">PrabhAI offers a seamless experience. Try voice interaction or start building your first AI project with Prabh AI Studio.</p>
            <Link href="/voice-interaction" passHref>
              <Button className="w-full bg-prabh-primary text-white hover:bg-prabh-secondary dark:bg-dark_prabh-primary dark:hover:bg-dark_prabh-secondary">
                <Zap className="mr-2 h-4 w-4" /> Try Voice Interaction
              </Button>
            </Link>
            <Link href="/studio" passHref>
              <Button variant="outline" className="w-full border-prabh-secondary text-prabh-secondary hover:bg-prabh-secondary/10 dark:border-dark_prabh-secondary dark:text-dark_prabh-secondary dark:hover:bg-dark_prabh-secondary/20">
                <Lightbulb className="mr-2 h-4 w-4" /> Explore Prabh AI Studio
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-card dark:shadow-dark_card hover:shadow-xl transition-shadow duration-300 bg-prabh-surface dark:bg-dark_prabh-surface">
          <CardHeader>
            <div className="aspect-[600/400] w-full overflow-hidden rounded-lg mb-2 bg-prabh-background dark:bg-dark_prabh-background flex items-center justify-center">
              {renderImageOrPlaceholder(personalizedExperienceImgSrc, "AI generated image for Personalized Experience", "AI personalization", personalizedExperienceError)}
            </div>
            <CardTitle className="text-prabh-text dark:text-dark_prabh-text">Personalized Experience</CardTitle>
            <CardDescription className="text-prabh-muted dark:text-dark_prabh-muted">PrabhAI adapts to you with its Persona Engine and Unforgettable Memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-prabh-text dark:text-dark_prabh-text">Customize your AI's personality and let it remember your preferences for truly unique interactions.</p>
             <Link href="/persona-engine" passHref>
              <Button variant="secondary" className="w-full mt-4 bg-prabh-secondary text-white hover:bg-prabh-primary dark:bg-dark_prabh-secondary dark:hover:bg-dark_prabh-primary">
                Configure Persona
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-card dark:shadow-dark_card hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1 bg-prabh-surface dark:bg-dark_prabh-surface">
          <CardHeader>
            <div className="aspect-[600/400] w-full overflow-hidden rounded-lg mb-2 bg-prabh-background dark:bg-dark_prabh-background flex items-center justify-center">
              {renderImageOrPlaceholder(powerfulFeaturesImgSrc, "AI generated image for Powerful AI Features", "AI capabilities", powerfulFeaturesError)}
            </div>
            <CardTitle className="text-prabh-text dark:text-dark_prabh-text">Powerful AI Features</CardTitle>
            <CardDescription className="text-prabh-muted dark:text-dark_prabh-muted">Leverage cutting-edge AI for real-time knowledge, media generation, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-prabh-muted dark:text-dark_prabh-muted">
              <li>Real-Time Knowledge Access</li>
              <li>Image & Video Generation</li>
              <li>Adaptive "Can Be Anything" Mode</li>
            </ul>
             <Link href="/media-generation" passHref>
                <Button variant="ghost" className="w-full mt-4 text-prabh-primary hover:bg-prabh-primary/10 dark:text-dark_prabh-primary dark:hover:bg-dark_prabh-primary/20">
                    Generate Media
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
