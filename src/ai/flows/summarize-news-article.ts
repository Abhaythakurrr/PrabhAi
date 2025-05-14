'use server';

/**
 * @fileOverview Summarizes a news article given its content.
 *
 * - summarizeNewsArticle - A function that handles the summarization process.
 * - SummarizeNewsArticleInput - The input type for the summarizeNewsArticle function.
 * - SummarizeNewsArticleOutput - The return type for the summarizeNewsArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNewsArticleInputSchema = z.object({
  articleContent: z.string().describe('The content of the news article to summarize.'),
});
export type SummarizeNewsArticleInput = z.infer<typeof SummarizeNewsArticleInputSchema>;

const SummarizeNewsArticleOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the news article.'),
});
export type SummarizeNewsArticleOutput = z.infer<typeof SummarizeNewsArticleOutputSchema>;

export async function summarizeNewsArticle(input: SummarizeNewsArticleInput): Promise<SummarizeNewsArticleOutput> {
  return summarizeNewsArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsArticlePrompt',
  input: {schema: SummarizeNewsArticleInputSchema},
  output: {schema: SummarizeNewsArticleOutputSchema},
  prompt: `Summarize the following news article in a concise manner:\n\n{{{articleContent}}}`, 
});

const summarizeNewsArticleFlow = ai.defineFlow(
  {
    name: 'summarizeNewsArticleFlow',
    inputSchema: SummarizeNewsArticleInputSchema,
    outputSchema: SummarizeNewsArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
