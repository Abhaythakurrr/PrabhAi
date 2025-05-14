import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks, PlayCircle, Code, Rocket, Lightbulb } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock AI flow
import { generateAppFromDescription, type GenerateAppInput, type GenerateAppOutput } from '@/ai/flows/generate-app-from-description';
import { Textarea } from "@/components/ui/textarea";
import React from "react";


export default function StudioPage() {
  const [appDescription, setAppDescription] = React.useState("");
  const [generatedApp, setGeneratedApp] = React.useState<GenerateAppOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateApp = async () => {
    if (!appDescription) return;
    setIsLoading(true);
    setGeneratedApp(null);
    try {
      const input: GenerateAppInput = { appDescription };
      // const output = await generateAppFromDescription(input);
      // setGeneratedApp(output);

      // Mocking the response
      await new Promise(resolve => setTimeout(resolve, 2500));
      setGeneratedApp({
        projectStructure: `
my-awesome-app/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   ├── pages/
│   │   └── index.tsx
│   └── App.tsx
├── public/
│   └── index.html
└── package.json
        `.trim(),
        codeSnippets: `
// src/components/Button.tsx
const Button = ({ children }) => <button>{children}</button>;

// src/App.tsx
import Button from './components/Button';
function App() {
  return (
    <div>
      <h1>My Awesome App based on: ${appDescription.substring(0,30)}...</h1>
      <Button>Click Me</Button>
    </div>
  );
}
export default App;
        `.trim(),
      });

    } catch (error) {
      console.error("Error generating app structure:", error);
      // Use toast for error
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 md:p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl md:text-4xl flex items-center gap-3">
                <Blocks className="h-10 w-10 text-primary" />
                Prabh AI Studio
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Your creative hub for building AI-powered apps, web games, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-muted-foreground">
                Prabh AI Studio offers an intuitive environment to bring your ideas to life. 
                Utilize powerful AI tools, drag-and-drop interfaces (coming soon!), and a robust code editor 
                to design, develop, and deploy your projects with ease.
              </p>
              <div className="flex gap-2">
                <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <Rocket className="mr-2 h-5 w-5" /> Start a New Project
                </Button>
                <Button variant="outline" size="lg">
                  <PlayCircle className="mr-2 h-5 w-5" /> View Tutorials
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="md:w-1/2 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4 md:p-0">
             <Image 
                src="https://placehold.co/600x400.png" 
                alt="Prabh AI Studio Interface Mockup" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-2xl object-cover"
                data-ai-hint="developer coding interface"
            />
          </div>
        </div>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            Generate App Outline with AI
          </CardTitle>
          <CardDescription>
            Describe your app idea, and let AI sketch out a basic structure and code snippets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., A simple to-do list app with user authentication and categories..."
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            rows={3}
            className="text-base"
          />
          <Button onClick={handleGenerateApp} disabled={isLoading || !appDescription} className="w-full">
            {isLoading ? "Generating..." : "Generate App Outline"}
          </Button>
          {generatedApp && (
            <div className="space-y-4 mt-4 border p-4 rounded-md bg-muted/20">
              <div>
                <h4 className="font-semibold text-lg">Project Structure:</h4>
                <pre className="text-sm bg-background p-2 rounded-md overflow-x-auto">
                  <code>{generatedApp.projectStructure}</code>
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Code Snippets:</h4>
                <pre className="text-sm bg-background p-2 rounded-md overflow-x-auto">
                  <code className="language-javascript">{generatedApp.codeSnippets}</code>
                </pre>
              </div>
            </div>
          )}
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            App outline generation is powered by AI (mocked). Full studio features are under development.
          </p>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Drag & Drop Interface</CardTitle>
            <CardDescription>Visually construct your application's UI and logic. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Visual Builder Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Integrated Code Editor</CardTitle>
            <CardDescription>Fine-tune your AI-generated code or write custom scripts with ease. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-40 bg-muted rounded-md flex items-center justify-center">
              <Code className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
