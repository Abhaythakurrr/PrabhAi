
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks, PlayCircle, Code, Rocket, Lightbulb, Loader2, ImageIcon, FolderTree, FileCode2 } from "lucide-react";
import NextImage from "next/image";
import { generateAppFromDescription, type GenerateAppInput, type GenerateAppOutput } from '@/ai/flows/generate-app-from-description';
import { generateImageFromDescription } from '@/ai/flows/generate-image-from-description';
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";


export default function StudioPage() {
  const [appDescription, setAppDescription] = React.useState("");
  const [generatedApp, setGeneratedApp] = React.useState<GenerateAppOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [studioImageUrl, setStudioImageUrl] = useState("https://placehold.co/600x400.png");
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudioImage = async () => {
      try {
        const output = await generateImageFromDescription({ description: "coding interface" });
        if (output.imageDataUri) {
          setStudioImageUrl(output.imageDataUri);
        }
      } catch (error) {
        console.error("Failed to generate studio image:", error);
      }
    };
    fetchStudioImage();
  }, []);


  const handleGenerateApp = async () => {
    if (!appDescription.trim()) {
       toast({
        variant: "destructive",
        title: "Prabh Needs Ideas!",
        description: "Describe the app you want Prabh to outline.",
      });
      return;
    }
    setIsLoading(true);
    setGeneratedApp(null);
    try {
      const input: GenerateAppInput = { appDescription };
      const output = await generateAppFromDescription(input);
      setGeneratedApp(output);
      toast({
        title: "Prabh Sketched Your App!",
        description: "The app outline and snippets are ready.",
      });

    } catch (error) {
      console.error("Error generating app structure with Prabh:", error);
      toast({
        variant: "destructive",
        title: "Prabh's Blueprint Failed!",
        description: "Could not generate the app outline. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl overflow-hidden bg-card">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 md:p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl md:text-4xl flex items-center gap-3 text-primary">
                <Blocks className="h-10 w-10" />
                Prabh AI Studio
              </CardTitle>
              <CardDescription className="text-lg mt-1 text-muted-foreground">
                Your creative hub for building AI-powered apps, web games, and more with Prabh.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-muted-foreground">
                Welcome to Prabh AI Studio! Here, Prabh helps you bring ideas to life.
                Use AI to generate project structures, get code assistance, and (soon!) visually design your apps.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <Rocket className="mr-2 h-5 w-5" /> Start New Project (Soon!)
                </Button>
                <Button variant="outline" size="lg">
                  <PlayCircle className="mr-2 h-5 w-5" /> Prabh's Tutorials (Soon!)
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="md:w-1/2 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4 md:p-0 min-h-[200px] md:min-h-0">
            {studioImageUrl === "https://placehold.co/600x400.png" ? (
                <ImageIcon className="h-16 w-16 text-muted-foreground" data-ai-hint="coding interface"/>
            ) : (
              <NextImage
                  src={studioImageUrl}
                  alt="Prabh AI Studio Interface"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl object-cover"
                  data-ai-hint="coding interface"
                  unoptimized={studioImageUrl.startsWith('data:')}
              />
            )}
          </div>
        </div>
      </Card>

      <Card className="shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-accent">
            <Lightbulb className="h-7 w-7" />
            Generate App Outline with Prabh
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Describe your app idea, and Prabh will sketch out a basic structure and code snippets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., A simple to-do list app with user authentication and categories, built with Next.js and Tailwind..."
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            rows={4}
            className="text-base bg-background text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <Button onClick={handleGenerateApp} disabled={isLoading || !appDescription.trim()} className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Rocket className="mr-2 h-5 w-5"/>}
            {isLoading ? "Prabh is Generating..." : "Ask Prabh to Generate Outline"}
          </Button>
          {generatedApp && (
            <div className="space-y-6 mt-6">
              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <FolderTree className="h-6 w-6" />
                    Prabh's Proposed Project Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto text-foreground shadow-inner">
                    <code>{generatedApp.projectStructure}</code>
                  </pre>
                </CardContent>
              </Card>
              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                     <FileCode2 className="h-6 w-6" />
                    Prabh's Example Code Snippets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto text-foreground shadow-inner">
                    <code className="language-javascript">{generatedApp.codeSnippets}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            App outlines are AI-generated by Prabh. Full studio features are evolving!
          </p>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Drag & Drop Interface</CardTitle>
            <CardDescription className="text-muted-foreground">Visually construct your application's UI and logic. (Prabh is learning this!) </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted/20 rounded-md flex items-center justify-center border border-dashed border-border">
              <p className="text-muted-foreground">Visual Builder (Coming Soon)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Integrated Code Editor</CardTitle>
            <CardDescription className="text-muted-foreground">Fine-tune AI code or write custom scripts. (Prabh is getting this ready!)</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-40 bg-muted/20 rounded-md flex items-center justify-center border border-dashed border-border">
              <Code className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
