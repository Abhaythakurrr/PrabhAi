
'use server';

/**
 * @fileOverview Summarizes a news article given its content, in Prabh's voice.
 *
 * - summarizeNewsArticle - A function that handles the summarization process.
 * - SummarizeNewsArticleInput - The input type for the summarizeNewsArticle function.
 * - SummarizeNewsArticleOutput - The return type for the summarizeNewsArticle function.
 */

import {ai} from '@/ai/genkit';
import {getSystemPrompt} from '@/ai/persona';
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
  // System prompt is now generated dynamically in the flow
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
  async (input): Promise<SummarizeNewsArticleOutput> => {
    const systemMessage = getSystemPrompt("Prabh - Insightful Summarizer", "User has provided an article for summarization.");
    try {
      const {output} = await prompt({
        system: systemMessage,
        ...input
      });
      if (output && typeof output.summary === 'string' && output.summary.trim() !== "") {
        return output;
      }
      console.warn(
        'summarizeNewsArticlePrompt returned a malformed or empty output. Input:',
        JSON.stringify(input),
        'System Message:', systemMessage,
        'Actual output from prompt call:',
        JSON.stringify(output)
      );
      return { summary: "Prabh had a bit of trouble summarizing that. Maybe the article was too short, too complex, or something went sideways with my AI brain!" };
    } catch (error: any) {
      console.error(
        'Error during summarizeNewsArticleFlow execution. Input:',
        JSON.stringify(input),
        'System Message:', systemMessage,
        'Error:',
        error
      );
      let userMessage = "Apologies, Prabh encountered an unexpected issue while trying to summarize. Please try again shortly.";
      if (error.message && error.message.includes('Schema validation failed')) {
        userMessage = "Prabh read the article, but couldn't quite structure the summary. Maybe try a different article?";
      }
      return { summary: userMessage };
    }
  }
);
