// src/services/news-service.ts
'use server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null; // Full content might be truncated by NewsAPI depending on plan
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Article[];
  code?: string; // For errors
  message?: string; // For errors
}

export async function fetchTopHeadlines(
  country: string = 'us',
  category?: string,
  query?: string,
  pageSize: number = 20
): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    console.error('News API key is not configured.');
    // Returning an empty array or throwing a custom error might be better in a real app
    return mockArticles.slice(0, pageSize); // Fallback to mock data if key is missing
  }

  let url = `${NEWS_API_BASE_URL}/top-headlines?country=${country}&pageSize=${Math.min(pageSize, 100)}`;
  if (category) {
    url += `&category=${category}`;
  }
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': NEWS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData: NewsApiResponse = await response.json();
      console.error(`News API error (${response.status}): ${errorData.message || 'Failed to fetch news'}`);
      // Fallback or throw more specific error
      return mockArticles.slice(0, pageSize); 
    }

    const data: NewsApiResponse = await response.json();
    
    if (data.status === 'error') {
      console.error(`News API returned an error: ${data.message}`);
      return mockArticles.slice(0, pageSize);
    }

    return data.articles;
  } catch (error) {
    console.error('Failed to fetch news from News API:', error);
    return mockArticles.slice(0, pageSize); // Fallback to mock data on network or other errors
  }
}

// Mock data as a fallback, especially useful during development or API limits
const mockArticles: Article[] = [
  { source: { id: null, name: "Mock News Central" }, author: "Dr. Mock", title: "AI Writes Its Own News Now!", description: "In a stunning turn of events, AI has begun generating its own news content, and it's surprisingly accurate.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), content: "In a stunning turn of events, AI has begun generating its own news content, and it's surprisingly accurate. This could revolutionize journalism as we know it, or lead to a dystopian future where news is indistinguishable from AI propaganda. Only time will tell." },
  { source: { id: null, name: "Tech Mock Times" }, author: "Anna Lyst", title: "Quantum Computers: Are We There Yet?", description: "A deep dive into the current state of quantum computing and its potential impact on various sectors.", url: "#", urlToImage: null, publishedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), content: "Quantum computers promise to solve problems currently intractable for even the most powerful supercomputers. While true fault-tolerant quantum computers are still some years away, significant progress is being made in building and programming these fascinating machines. This article explores the latest breakthroughs and the challenges that remain." },
  { source: { id: null, name: "Eco Mock Chronicle" }, author: "Green Thumb", title: "Urban Farming Takes Root Globally", description: "More cities are embracing vertical farms and rooftop gardens to boost local food security and sustainability.", url: "#", urlToImage: null, publishedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), content: "As global populations increasingly concentrate in urban centers, innovative solutions for food production are becoming critical. Urban farming, encompassing everything from community gardens to high-tech vertical farms, is gaining momentum. These initiatives not only provide fresh produce locally but also reduce transportation costs and carbon emissions." },
];
