
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Lightbulb, Zap, Image as ImageIcon } from "lucide-react"; // Renamed to avoid conflict
import Link from "next/link";
import NextImage from "next/image"; // Renamed to avoid conflict with Lucide icon
import { useEffect, useState } from 'react';
import { generateImageFromDescription } from '@/ai/flows/generate-image-from-description';

export default function DashboardPage() {
  const [personalizedExperienceImgSrc, setPersonalizedExperienceImgSrc] = useState("https://placehold.co/600x400.png");
  const [powerfulFeaturesImgSrc, setPowerfulFeaturesImgSrc] = useState("https://placehold.co/600x400.png");

  useEffect(() => {
    const fetchAiImage = async (hint: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
      if (!hint) return;
      try {
        console.log(`Generating image for hint: ${hint}`);
        const output = await generateImageFromDescription({ description: hint });
        if (output.imageDataUri) {
          setter(output.imageDataUri);
          console.log(`Successfully generated image for hint: ${hint}`);
        } else {
          console.warn(`Image generation for hint "${hint}" did not return a data URI.`);
        }
      } catch (error) {
        console.error(`Failed to generate image for hint "${hint}":`, error);
        // Keeps placeholder on error
      }
    };

    fetchAiImage("AI personalization", setPersonalizedExperienceImgSrc);
    fetchAiImage("AI capabilities", setPowerfulFeaturesImgSrc);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome to PrabhAI</h1>
        <p className="text-lg text-muted-foreground">
          Your intelligent companion and creation suite. Explore the features below.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Rocket className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Get Started Quickly</CardTitle>
            <CardDescription>Jump right into interacting or creating with PrabhAI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>PrabhAI offers a seamless experience. Try voice interaction or start building your first AI project with Prabh AI Studio.</p>
            <Link href="/voice-interaction" passHref>
              <Button className="w-full">
                <Zap className="mr-2 h-4 w-4" /> Try Voice Interaction
              </Button>
            </Link>
            <Link href="/studio" passHref>
              <Button variant="outline" className="w-full">
                <Lightbulb className="mr-2 h-4 w-4" /> Explore Prabh AI Studio
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="aspect-[600/400] w-full overflow-hidden rounded-lg mb-2 bg-muted flex items-center justify-center">
              {personalizedExperienceImgSrc === "https://placehold.co/600x400.png" ? (
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
              ) : (
                <NextImage 
                  src={personalizedExperienceImgSrc} 
                  alt="AI generated image for Personalized Experience" 
                  width={600} 
                  height={400} 
                  className="object-cover w-full h-full"
                  data-ai-hint="AI personalization"
                  unoptimized={personalizedExperienceImgSrc.startsWith('data:')}
                />
              )}
            </div>
            <CardTitle>Personalized Experience</CardTitle>
            <CardDescription>PrabhAI adapts to you with its Persona Engine and Unforgettable Memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Customize your AI's personality and let it remember your preferences for truly unique interactions.</p>
             <Link href="/persona-engine" passHref>
              <Button variant="secondary" className="w-full mt-4">
                Configure Persona
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="aspect-[600/400] w-full overflow-hidden rounded-lg mb-2 bg-muted flex items-center justify-center">
                {powerfulFeaturesImgSrc === "https://placehold.co/600x400.png" ? (
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                ) : (
                  <NextImage 
                    src={powerfulFeaturesImgSrc} 
                    alt="AI generated image for Powerful AI Features" 
                    width={600} 
                    height={400} 
                    className="object-cover w-full h-full"
                    data-ai-hint="AI capabilities"
                    unoptimized={powerfulFeaturesImgSrc.startsWith('data:')}
                  />
                )}
            </div>
            <CardTitle>Powerful AI Features</CardTitle>
            <CardDescription>Leverage cutting-edge AI for real-time knowledge, media generation, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Real-Time Knowledge Access</li>
              <li>Image & Video Generation</li>
              <li>Adaptive "Can Be Anything" Mode</li>
            </ul>
             <Link href="/media-generation" passHref>
                <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                    Generate Media
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

