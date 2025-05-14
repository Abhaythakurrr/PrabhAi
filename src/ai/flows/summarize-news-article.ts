
'use server';

/**
 * @fileOverview Summarizes a news article given its content, in Prabh's voice.
 *
 * - summarizeNewsArticle - A function that handles the summarization process.
 * - SummarizeNewsArticleInput - The input type for the summarizeNewsArticle function.
 * - SummarizeNewsArticleOutput - The return type for the summarizeNewsArticle function.
 */

import {ai} from '@/ai/genkit';
import {PRABH_CORE_PROMPT} from '@/ai/persona';
import {z} from 'genkit';

const SummarizeNewsArticleInputSchema = z.object({
  articleContent: z.string().describe('The content of the news article to summarize.'),
});
export type SummarizeNewsArticleInput = z.infer<typeof SummarizeNewsArticleInputSchema>;

const SummarizeNewsArticleOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the news article, delivered by Prabh.'),
});
export type SummarizeNewsArticleOutput = z.infer<typeof SummarizeNewsArticleOutputSchema>;

export async function summarizeNewsArticle(input: SummarizeNewsArticleInput): Promise<SummarizeNewsArticleOutput> {
  return summarizeNewsArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsArticlePrompt',
  system: PRABH_CORE_PROMPT,
  input: {schema: SummarizeNewsArticleInputSchema},
  output: {schema: SummarizeNewsArticleOutputSchema},
  prompt: `Alright, I've got this news article here. My task is to give a crisp summary of it.

Here's the article content:
{{{articleContent}}}

Now, give me the summary, Prabh style:`, 
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

