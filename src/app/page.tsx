import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Lightbulb, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
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
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="AI interacting with user" 
              width={600} 
              height={400} 
              className="rounded-lg mb-2"
              data-ai-hint="AI personalization"
            />
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
             <Image 
              src="https://placehold.co/600x400.png" 
              alt="AI concept art" 
              width={600} 
              height={400} 
              className="rounded-lg mb-2"
              data-ai-hint="AI capabilities"
            />
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
