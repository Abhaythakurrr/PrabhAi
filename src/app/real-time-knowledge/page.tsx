'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper, Search, RotateCw, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeNewsArticle, type SummarizeNewsArticleInput, type SummarizeNewsArticleOutput } from '@/ai/flows/summarize-news-article';

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary?: string;
  content?: string; // Full content for summarization
}

const mockArticles: NewsArticle[] = [
  { id: "1", title: "Global Tech Summit Highlights AI Advancements", source: "Tech News Today", publishedAt: "2024-07-28T10:00:00Z", url: "#", content: "The Global Tech Summit concluded yesterday, showcasing significant breakthroughs in artificial intelligence, particularly in natural language processing and computer vision. Experts predict these advancements will revolutionize industries within the next five years."},
  { id: "2", title: "New Space Telescope Captures Stunning Nebula Images", source: "Science Daily", publishedAt: "2024-07-28T09:30:00Z", url: "#", content: "NASA's new orbiting telescope has delivered its first set of images, revealing breathtaking views of distant nebulae with unprecedented clarity. These images are expected to provide new insights into star formation and galactic evolution."},
  { id: "3", title: "Economic Outlook: Inflation Concerns Continue", source: "Financial Times", publishedAt: "2024-07-28T09:00:00Z", url: "#", content: "Central banks worldwide are grappling with persistent inflation. Recent data suggests that while some pressures may be easing, the overall economic outlook remains uncertain, with potential rate hikes on the horizon."},
];

export default function RealTimeKnowledgePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [summarizingArticleId, setSummarizingArticleId] = useState<string | null>(null);

  const fetchNews = () => {
    setIsLoading(true);
    // Simulate fetching news
    setTimeout(() => {
      setArticles(mockArticles.map(a => ({...a, summary: undefined}))); // Reset summaries on refresh
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleSummarize = async (article: NewsArticle) => {
    if (!article.content) {
      alert("Full article content not available for summarization.");
      return;
    }
    setSummarizingArticleId(article.id);
    try {
      const input: SummarizeNewsArticleInput = { articleContent: article.content };
      // const output: SummarizeNewsArticleOutput = await summarizeNewsArticle(input);
      // Mocking AI call to avoid client-side Genkit complexities in this setup
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      const mockSummary = `This article discusses ${article.title.toLowerCase()}, emphasizing its key developments and potential impact. It appears to be a significant event in its respective field.`;

      setArticles(prevArticles => 
        prevArticles.map(a => a.id === article.id ? { ...a, summary: mockSummary /* output.summary */ } : a)
      );
    } catch (error) {
      console.error("Error summarizing article:", error);
      alert("Failed to summarize article.");
    } finally {
      setSummarizingArticleId(null);
    }
  };


  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.source.toLowerCase().includes(searchTerm.toLowerCase())
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
            Access and search for the latest news headlines. PrabhAI can use this information in its responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search news articles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={fetchNews} variant="outline" disabled={isLoading}>
              <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {filteredArticles.length > 0 ? filteredArticles.map(article => (
                <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-primary">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {article.source} - {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                  {article.summary ? (
                    <p className="text-sm mb-2">{article.summary}</p>
                  ) : article.content && (
                     <p className="text-sm mb-2 text-muted-foreground truncate_small_text">{article.content.substring(0,100)}...</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleSummarize(article)}
                      disabled={summarizingArticleId === article.id || !article.content}
                    >
                      {summarizingArticleId === article.id ? "Summarizing..." : "Summarize with AI"}
                    </Button>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Read More <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </Card>
              )) : (
                <p className="text-center text-muted-foreground">No articles found matching your search.</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            News headlines are mock data. Real integration requires News API. Summaries are AI-generated (mocked).
          </p>
        </CardFooter>
      </Card>
      <style jsx>{`
        .truncate_small_text {
           display: -webkit-box;
           -webkit-line-clamp: 2;
           -webkit-box-orient: vertical;  
           overflow: hidden;
        }
      `}</style>
    </div>
  );
}
