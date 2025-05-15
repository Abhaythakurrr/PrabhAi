'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon as ImageLucide, Film, Sparkles, Loader2 } from "lucide-react"; // Renamed ImageIcon
import NextImage from "next/image"; 
import { Progress } from "@/components/ui/progress";
import { generateImageFromDescription, type GenerateImageFromDescriptionInput, type GenerateImageFromDescriptionOutput } from '@/ai/flows/generate-image-from-description';
import { useToast } from "@/hooks/use-toast";

export default function MediaGenerationPage() {
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress += 5; 
        if (currentProgress > 100) {
          setProgress(100);
          clearInterval(timer);
        } else {
          setProgress(currentProgress);
        }
      }, mediaType === 'image' ? 150 : 300); // Image gen faster progress
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoading, mediaType]);

  const handleGenerateMedia = async () => {
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Describe First, Prabh!",
        description: `Prabh needs a description to generate a ${mediaType}.`,
      });
      return;
    }
    setIsLoading(true);
    setGeneratedMediaUrl(null);

    try {
      if (mediaType === 'image') {
        const input: GenerateImageFromDescriptionInput = { description };
        const output: GenerateImageFromDescriptionOutput = await generateImageFromDescription(input);
        setGeneratedMediaUrl(output.imageDataUri);
        toast({
          title: "Prabh Crafted an Image!",
          description: "Your image is ready to view.",
        });
      } else {
        // Video generation mock
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
        // Using a static placeholder that looks like a video file URL for mock.
        setGeneratedMediaUrl("https://placehold.co/600x400.mp4/7C4DFF/FFFFFF?text=Prabh's+Amazing+Video+(Mock)"); 
        toast({
          title: "Prabh's Video (Mock) Ready!",
          description: "This is a placeholder for video generation.",
        });
      }
    } catch (error) {
      console.error(`Error generating ${mediaType} with Prabh:`, error);
      toast({
        variant: "destructive",
        title: `Prabh's ${mediaType} Machine Stalled!`,
        description: `Failed to generate ${mediaType}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAiHint = (desc: string): string => {
    return desc.trim().toLowerCase().split(/\s+/).slice(0, 2).join(" ") || "ai art";
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            {mediaType === 'image' ? <ImageLucide className="h-7 w-7" /> : <Film className="h-7 w-7" />}
            Prabh's Creative {mediaType === 'image' ? 'Image Studio' : 'Video Lab (Mock)'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Tell Prabh what {mediaType} you envision.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={mediaType === 'image' ? 'default' : 'outline'} 
              onClick={() => { setMediaType('image'); setGeneratedMediaUrl(null); setDescription(""); }}
              className="flex-1"
            >
              <ImageLucide className="mr-2 h-4 w-4" /> Image
            </Button>
            <Button 
              variant={mediaType === 'video' ? 'default' : 'outline'} 
              onClick={() => { setMediaType('video'); setGeneratedMediaUrl(null); setDescription(""); }}
              className="flex-1"
            >
              <Film className="mr-2 h-4 w-4" /> Video (Mock)
            </Button>
          </div>

          <Textarea
            placeholder={`Describe the ${mediaType} Prabh should create...\ne.g., "A majestic lion with a crown made of stars, cosmic background" for an image.`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="text-base bg-background text-foreground placeholder:text-muted-foreground"
          />
          
          <Button onClick={handleGenerateMedia} disabled={isLoading || !description.trim()} className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? `Prabh is Creating ${mediaType}...` : `Generate ${mediaType} with Prabh`}
          </Button>

          {isLoading && <Progress value={progress} className="w-full h-2" />}

          {generatedMediaUrl && (
            <div className="mt-6 border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="text-lg font-semibold mb-2 text-center text-primary">Prabh's Generated {mediaType}:</h3>
              {mediaType === 'image' ? (
                <NextImage 
                  src={generatedMediaUrl} 
                  alt={`AI generated image by Prabh for: ${description}`} 
                  width={600} 
                  height={400} 
                  className="rounded-md shadow-lg mx-auto object-contain"
                  data-ai-hint={getAiHint(description)}
                  unoptimized={generatedMediaUrl.startsWith('data:')} // Important for base64 images
                />
              ) : (
                <div className="bg-black rounded-md p-2 aspect-video flex items-center justify-center mx-auto max-w-md shadow-lg">
                    <p className="text-white text-center p-4">
                      This is a mock video. In a real app, Prabh would show your video here!
                      <br/> <span className="text-sm opacity-80">({generatedMediaUrl.split('?text=')[1]?.split('&')[0] || "Video Content"})</span>
                    </p>
                    {/* <video controls src={generatedMediaUrl} className="w-full rounded-md shadow-md"></video> */}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Prabh's image generation uses AI magic. Video generation is a mock-up for now.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
