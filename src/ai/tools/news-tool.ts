
'use server';
/**
 * @fileOverview A Genkit tool for fetching the latest news headlines.
 *
 * - getLatestNewsHeadlinesTool - A Genkit tool that uses the news-service to fetch articles.
 */

import {ai} from '@/ai/genkit';
import {fetchTopHeadlines} from '@/services/news-service';
import {z} from 'genkit';

const GetLatestNewsInputSchema = z.object({
  query: z.string().optional().describe('A specific topic or keyword to search for in the news. Example: "artificial intelligence trends"'),
  category: z.string().optional().describe('A news category to filter by. Examples: "technology", "business", "sports"'),
  country: z.string().optional().describe('The 2-letter ISO 3166-1 code of the country to get headlines for. Example: "us", "pk", "in". If not provided, defaults to a general search or "us".'),
  maxHeadlines: z.number().default(5).describe('Maximum number of headlines to return. Default: 5, Max: 20.'),
});

const NewsHeadlineSchema = z.object({
  title: z.string().describe("The headline of the news article."),
  source: z.string().describe("The name of the news source (e.g., 'Reuters', 'BBC News')."),
  url: z.string().url().describe("The direct URL to the news article."),
  publishedAt: z.string().datetime().describe("The publication date and time of the article in ISO 8601 format."),
  description: z.string().nullable().describe("A brief description or snippet of the article content."),
});

const GetLatestNewsOutputSchema = z.object({
  headlines: z.array(NewsHeadlineSchema).describe('A list of the latest news headlines relevant to the query.'),
});

export const getLatestNewsHeadlinesTool = ai.defineTool(
  {
    name: 'getLatestNewsHeadlines',
    description: "Fetches the latest news headlines. Use this tool primarily when the user explicitly asks for news updates (e.g., 'what's the latest news on X?', 'check headlines for Y') or if their query strongly implies a desire for a live news feed update rather than relying on your general knowledge. You can specify a query, category, or country.",
    inputSchema: GetLatestNewsInputSchema,
    outputSchema: GetLatestNewsOutputSchema,
  },
  async (input) => {
    const articles = await fetchTopHeadlines(input.country || 'us', input.category, input.query, Math.min(input.maxHeadlines, 20));
    
    if (!articles || articles.length === 0) {
      return { headlines: [] };
    }
    
    return {
      headlines: articles.map(article => ({
        title: article.title,
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt,
        description: article.description,
      })),
    };
  }
);

