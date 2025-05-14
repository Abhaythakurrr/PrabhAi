'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper, Search, RotateCw, ExternalLink, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeNewsArticle, type SummarizeNewsArticleInput, type SummarizeNewsArticleOutput } from '@/ai/flows/summarize-news-article';
import { fetchTopHeadlines, type Article as NewsApiServiceArticle } from '@/services/news-service'; // Renamed to avoid conflict
import { useToast } from "@/hooks/use-toast";


interface NewsArticle extends NewsApiServiceArticle {
  id: string; // Ensure id for local state key
  aiSummary?: string;
}

export default function RealTimeKnowledgePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [summarizingArticleId, setSummarizingArticleId] = useState<string | null>(null);
  const { toast } = useToast();

  const mapApiArticleToLocal = (apiArticle: NewsApiServiceArticle, index: number): NewsArticle => ({
    ...apiArticle,
    id: apiArticle.url || `article-${index}-${new Date().getTime()}`, // Create a unique ID
    aiSummary: undefined,
  });

  const fetchNews = async (query?: string) => {
    setIsLoading(true);
    try {
      const fetchedApiArticles = await fetchTopHeadlines('us', undefined, query, 20);
      setArticles(fetchedApiArticles.map(mapApiArticleToLocal));
    } catch (error) {
      console.error("Failed to fetch news:", error);
      toast({
        variant: "destructive",
        title: "Error fetching news",
        description: "Could not load articles. Displaying mocks.",
      });
       // Fallback to some mock display or empty if desired
       // For now, we can rely on the service's internal mock as a fallback
       const mockFallback = await fetchTopHeadlines(); // This will trigger service's mock if API fails
       setArticles(mockFallback.map(mapApiArticleToLocal));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleSearch = () => {
    fetchNews(searchTerm);
  };

  const handleSummarize = async (article: NewsArticle) => {
    if (!article.content && !article.description) {
      toast({
        variant: "destructive",
        title: "Content Missing",
        description: "Full article content not available for summarization by Prabh.",
      });
      return;
    }
    setSummarizingArticleId(article.id);
    try {
      // Use content if available, otherwise description as fallback for summarization
      const contentToSummarize = article.content || article.description || "";
      if (!contentToSummarize) {
         toast({
          variant: "destructive",
          title: "Not Enough Content",
          description: "Prabh needs more text to summarize this article.",
        });
        setSummarizingArticleId(null);
        return;
      }
      const input: SummarizeNewsArticleInput = { articleContent: contentToSummarize };
      const output: SummarizeNewsArticleOutput = await summarizeNewsArticle(input);
      
      setArticles(prevArticles => 
        prevArticles.map(a => a.id === article.id ? { ...a, aiSummary: output.summary } : a)
      );
      toast({
        title: "Prabh Summarized!",
        description: `Prabh has summarized "${article.title}".`,
      });
    } catch (error) {
      console.error("Error summarizing article with Prabh:", error);
      toast({
        variant: "destructive",
        title: "Prabh's Summary Failed",
        description: "Prabh couldn't summarize the article right now. Try again!",
      });
    } finally {
      setSummarizingArticleId(null);
    }
  };

  // Client-side filtering based on fetched articles
   const displayedArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Real-Time Knowledge
          </CardTitle>
          <CardDescription>
            Access and search the latest news. PrabhAI can summarize articles for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Search news by keyword..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow"
              aria-label="Search news articles"
            />
            <Button onClick={handleSearch} variant="outline" disabled={isLoading} aria-label="Search news">
              <Search className={`h-4 w-4 ${isLoading && searchTerm ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
            <Button onClick={() => fetchNews()} variant="outline" disabled={isLoading} aria-label="Refresh news">
              <RotateCw className={`h-4 w-4 ${isLoading && !searchTerm ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4 bg-muted/10">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {displayedArticles.length > 0 ? displayedArticles.map(article => (
                <Card key={article.id} className="p-4 hover:shadow-md transition-shadow bg-card">
                  <h3 className="text-lg font-semibold text-primary">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {article.source.name} - {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm mb-2 text-muted-foreground truncate_small_text">
                    {article.description || "No description available."}
                  </p>
                  {article.aiSummary && (
                    <blockquote className="mt-2 mb-2 p-3 bg-muted/50 border-l-4 border-accent rounded">
                      <p className="text-sm italic text-accent-foreground/90">
                        <strong className="text-accent">Prabh's Summary:</strong> {article.aiSummary}
                      </p>
                    </blockquote>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleSummarize(article)}
                      disabled={summarizingArticleId === article.id || (!article.content && !article.description)}
                    >
                      {summarizingArticleId === article.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Prabh is Summarizing...</>
                      ) : "Summarize with Prabh"}
                    </Button>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Read Full Article <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </Card>
              )) : (
                <p className="text-center text-muted-foreground py-10">No articles found, Prabh. Try a different search or refresh.</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            News provided by NewsAPI. Summaries are AI-generated by Prabh.
          </p>
        </CardFooter>
      </Card>
      <style jsx>{`
        .truncate_small_text {
           display: -webkit-box;
           -webkit-line-clamp: 3; /* Show a bit more */
           -webkit-box-orient: vertical;  
           overflow: hidden;
        }
      `}</style>
    </div>
  );
}
