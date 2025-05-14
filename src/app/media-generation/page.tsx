'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon as Image, Film, Sparkles, Loader2 } from "lucide-react"; // Renamed ImageIcon
import NextImage from "next/image"; // For displaying images
import { Progress } from "@/components/ui/progress";

// Mock AI flow. In a real app, this would call your GenAI backend for image generation.
import { generateImageFromDescription, type GenerateImageFromDescriptionInput, type GenerateImageFromDescriptionOutput } from '@/ai/flows/generate-image-from-description';

export default function MediaGenerationPage() {
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress += 5; // Slower progress for media generation
        if (currentProgress > 100) {
          clearInterval(timer);
        } else {
          setProgress(currentProgress);
        }
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleGenerateMedia = async () => {
    if (!description) return;
    setIsLoading(true);
    setGeneratedMediaUrl(null);

    try {
      if (mediaType === 'image') {
        const input: GenerateImageFromDescriptionInput = { description };
        // const output: GenerateImageFromDescriptionOutput = await generateImageFromDescription(input);
        // setGeneratedMediaUrl(output.imageDataUri);

        // Mocking the response for now
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
        const placeholderKeywords = description.toLowerCase().split(" ").slice(0,2).join("+") || "abstract";
        setGeneratedMediaUrl(`https://placehold.co/600x400.png?text=${encodeURIComponent('AI Generated: '+description.substring(0,20))}&font=roboto&bg=008080&txt=FFFFFF`);
      } else {
        // Video generation mock
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
        setGeneratedMediaUrl("https://placehold.co/600x400.mp4/008080/FFFFFF?text=AI+Generated+Video"); // Placeholder video
      }
    } catch (error) {
      console.error(`Error generating ${mediaType}:`, error);
      // In a real app, use toast notifications
      alert(`Failed to generate ${mediaType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {mediaType === 'image' ? <Image className="h-6 w-6 text-primary" /> : <Film className="h-6 w-6 text-primary" />}
            {mediaType === 'image' ? 'Image Generation' : 'Video Generation'}
          </CardTitle>
          <CardDescription>
            Describe the {mediaType} you want PrabhAI to create. Uses Eden API/OpenRouter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={mediaType === 'image' ? 'default' : 'outline'} 
              onClick={() => { setMediaType('image'); setGeneratedMediaUrl(null); }}
              className="flex-1"
            >
              <Image className="mr-2 h-4 w-4" /> Image
            </Button>
            <Button 
              variant={mediaType === 'video' ? 'default' : 'outline'} 
              onClick={() => { setMediaType('video'); setGeneratedMediaUrl(null); }}
              className="flex-1"
            >
              <Film className="mr-2 h-4 w-4" /> Video (Mock)
            </Button>
          </div>

          <Textarea
            placeholder={`Enter a detailed description for your ${mediaType}... \ne.g., "A futuristic cityscape at sunset with flying cars" for an image, or "A short clip of a cat playing with a laser pointer" for a video.`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="text-base"
          />
          
          <Button onClick={handleGenerateMedia} disabled={isLoading || !description} className="w-full text-lg py-3">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? `Generating ${mediaType}...` : `Generate ${mediaType}`}
          </Button>

          {isLoading && <Progress value={progress} className="w-full" />}

          {generatedMediaUrl && (
            <div className="mt-6 border rounded-lg p-4 bg-muted/30">
              <h3 className="text-lg font-semibold mb-2 text-center">Generated {mediaType}:</h3>
              {mediaType === 'image' ? (
                <NextImage 
                  src={generatedMediaUrl} 
                  alt={`AI generated image for: ${description}`} 
                  width={600} 
                  height={400} 
                  className="rounded-md shadow-md mx-auto"
                  data-ai-hint={description.split(" ").slice(0,2).join(" ") || "placeholder image"}
                />
              ) : (
                <div className="bg-black rounded-md p-2 aspect-video flex items-center justify-center mx-auto max-w-md">
                    <p className="text-white text-center">Video Placeholder: {generatedMediaUrl.split('?text=')[1]}</p>
                    {/* In a real app, you'd use a <video> tag here */}
                    {/* <video controls src={generatedMediaUrl} className="w-full rounded-md shadow-md"></video> */}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Media generation is simulated. Video generation is a mock-up. Real integration requires Eden API/OpenRouter.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
