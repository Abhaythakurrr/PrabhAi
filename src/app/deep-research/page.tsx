
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Library, Search, Loader2, FileText, ListChecks, AlertTriangle } from "lucide-react";
import { conductDeepResearch, type ConductDeepResearchInput, type ConductDeepResearchOutput } from '@/ai/flows/conduct-deep-research-flow';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

export default function DeepResearchPage() {
  const [query, setQuery] = useState("");
  const [researchResult, setResearchResult] = useState<ConductDeepResearchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResearchRequest = async () => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Prabh Needs a Query!",
        description: "Please provide a topic for Prabh to research.",
      });
      return;
    }
    setIsLoading(true);
    setResearchResult(null);

    try {
      const input: ConductDeepResearchInput = { userQuery: query };
      const output = await conductDeepResearch(input);
      setResearchResult(output);
      toast({
        title: "Prabh's Research Complete!",
        description: "The deep dive findings are ready.",
      });
    } catch (error) {
      console.error("Error during deep research with Prabh:", error);
      toast({
        variant: "destructive",
        title: "Prabh's Investigation Hit a Snag!",
        description: "Could not complete the deep research. Please try again.",
      });
      // Optionally, set a partial error state in researchResult if needed
      setResearchResult({
        reportTitle: "Research Incomplete",
        executiveSummary: "An error occurred during the research process.",
        detailedFindings: "Prabh was unable to complete the investigation for your query. Please try rephrasing or try again later.",
        potentialSources: [],
        limitations: "The research could not be performed due to an unexpected issue."
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
            <Library className="h-10 w-10" />
            Prabh's Deep Research Desk
          </CardTitle>
          <CardDescription className="text-lg mt-1 text-muted-foreground">
            Submit your complex questions or topics, and Prabh will conduct a thorough investigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="research-query" className="block text-lg font-medium text-foreground mb-2">
              What would you like Prabh to investigate?
            </label>
            <Textarea
              id="research-query"
              placeholder="e.g., Analyze the impact of quantum computing on cybersecurity by 2030..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={5}
              className="text-base bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleResearchRequest} 
            disabled={isLoading || !query.trim()} 
            className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Search className="mr-2 h-6 w-6" />
            )}
            {isLoading ? "Prabh is Investigating..." : "Start Deep Research with Prabh"}
          </Button>
        </CardContent>
      </Card>

      {researchResult && (
        <Card className="shadow-lg bg-card mt-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-primary">
              <FileText className="h-7 w-7" />
              {researchResult.reportTitle || "Research Findings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">Executive Summary</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{researchResult.executiveSummary}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">Detailed Findings</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
                {researchResult.detailedFindings}
              </div>
            </div>
            {researchResult.potentialSources && researchResult.potentialSources.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold text-accent mb-2">
                    <ListChecks className="inline-block mr-2 h-6 w-6" />
                    Potential Information Avenues
                  </h3>
                  <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                    {researchResult.potentialSources.map((source, index) => (
                      <li key={index}>
                        <strong className="text-foreground">{source.name}:</strong> {source.relevance}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {researchResult.limitations && (
               <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold text-destructive mb-2">
                    <AlertTriangle className="inline-block mr-2 h-6 w-6" />
                    Limitations & Caveats
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{researchResult.limitations}</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Research conducted by Prabh. Information is AI-generated and may require verification for critical decisions.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
