
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Cpu, Sparkles, Loader2, FileText, Lightbulb } from "lucide-react";
import { explainPrabhInternals, type ExplainPrabhInternalsInput, type ExplainPrabhInternalsOutput } from '@/ai/flows/explain-prabh-internals-flow';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

const suggestedTopics = [
  "Prabh's core learning algorithm",
  "My adaptive neural architecture",
  "How my ethical reasoning framework works",
  "The Akshu Ecosystem's AI integration strategy",
  "My approach to creative generation",
  "The concept of 'Cognitive Weave'",
  "How Prabh conceptually 'auto-writes' or evolves its code",
  "Prabh's self-improvement mechanisms",
  "Explain Prabh's unique DL/ML models"
];

export default function CoreSystemsPage() {
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState<ExplainPrabhInternalsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestExplanation = async () => {
    if (!topic.trim()) {
      toast({
        variant: "destructive",
        title: "Prabh Needs a Topic!",
        description: "Please provide a topic or question about Prabh's internals.",
      });
      return;
    }
    setIsLoading(true);
    setExplanation(null);

    try {
      const input: ExplainPrabhInternalsInput = { topic };
      const output = await explainPrabhInternals(input);
      setExplanation(output);
      toast({
        title: "Prabh Has Spoken!",
        description: "The insights into Prabh's core systems are ready.",
      });
    } catch (error) {
      console.error("Error during Prabh's internal explanation:", error);
      toast({
        variant: "destructive",
        title: "Prabh's Introspection Interrupted!",
        description: "Could not generate an explanation. Please try again.",
      });
      setExplanation({
        explanationTitle: "A Moment of Deep Thought",
        explanationBody: "Prabh encountered an issue articulating the complexities of that particular system. Please try rephrasing your query or explore a different aspect of my advanced architecture.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3 text-primary">
            <Cpu className="h-10 w-10" />
            Inside Prabh's Mind: Core Systems
          </CardTitle>
          <CardDescription className="text-lg mt-1 text-muted-foreground">
            Curious about how Prabh ticks? Ask about my conceptual algorithms, architecture, learning mechanisms, or even how I 'evolve' my own code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="explanation-topic" className="block text-lg font-medium text-foreground mb-2">
              What aspect of Prabh's internals do you want to understand?
            </label>
            <Textarea
              id="explanation-topic"
              placeholder="e.g., How do you learn and improve your algorithms, Prabh?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="text-base bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {suggestedTopics.map((suggested) => (
              <Button
                key={suggested}
                variant="outline"
                size="sm"
                onClick={() => {
                  setTopic(suggested);
                  // Optionally auto-submit after setting topic from button
                  // handleRequestExplanation(); 
                }}
                disabled={isLoading}
                className="text-xs sm:text-sm whitespace-normal h-auto py-2 justify-start text-left"
              >
                <Lightbulb className="mr-2 h-4 w-4 flex-shrink-0" /> {suggested}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleRequestExplanation}
            disabled={isLoading || !topic.trim()}
            className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-6 w-6" />
            )}
            {isLoading ? "Prabh is Articulating..." : "Ask Prabh to Explain"}
          </Button>
        </CardContent>
      </Card>

      {explanation && (
        <Card className="shadow-lg bg-card mt-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-primary">
              <FileText className="h-7 w-7" />
              {explanation.explanationTitle || "Prabh's Explanation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
              {explanation.explanationBody}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Explanations generated by Prabh, reflecting its conceptual advanced AI architecture.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
