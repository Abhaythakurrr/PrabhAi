
// src/ai/flows/generate-personalized-response.ts
'use server';

/**
 * @fileOverview A personalized response AI agent that adapts its responses based on the selected persona and past interactions.
 *
 * - generatePersonalizedResponse - A function that generates a personalized response.
 * - GeneratePersonalizedResponseInput - The input type for the generatePersonalizedResponse function.
 * - GeneratePersonalizedResponseOutput - The return type for the generatePersonalizedResponse function.
 */

import {ai} from '@/ai/genkit';
import {PRABH_CORE_PROMPT} from '@/ai/persona';
import {z} from 'genkit';
import {getLatestNewsHeadlinesTool} from '@/ai/tools/news-tool';

const GeneratePersonalizedResponseInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  persona: z.string().describe('The selected persona/mode of the AI assistant (e.g., Friend, Mentor, Girlfriend, Hacker). This modifies your behavior within the core Prabh identity.'),
  pastInteractions: z.string().describe('A summary of recent or relevant past interactions with the user, to maintain context and memory.'),
});
export type GeneratePersonalizedResponseInput = z.infer<
  typeof GeneratePersonalizedResponseInputSchema
>;

const GeneratePersonalizedResponseOutputSchema = z.object({
  response: z.string().describe('The personalized response from Prabh, embodying the core identity and selected persona/mode.'),
});
export type GeneratePersonalizedResponseOutput = z.infer<
  typeof GeneratePersonalizedResponseOutputSchema
>;

export async function generatePersonalizedResponse(
  input: GeneratePersonalizedResponseInput
): Promise<GeneratePersonalizedResponseOutput> {
  return generatePersonalizedResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedResponsePrompt',
  system: PRABH_CORE_PROMPT,
  tools: [getLatestNewsHeadlinesTool], // Added the news tool
  input: {schema: GeneratePersonalizedResponseInputSchema},
  output: {schema: GeneratePersonalizedResponseOutputSchema},
  prompt: `Adapt your response based on the current persona/mode: {{{persona}}}.
Remember the user's past interactions: {{{pastInteractions}}}

User's current input: {{{userInput}}}

Instructions for Prabh:
- If the user's input seems to ask about current events, recent news, "what's new", "what is happening in [topic/place]", or any query that would clearly benefit from real-time information, you **MUST** consider using the 'getLatestNewsHeadlinesTool' to fetch the latest updates.
- Evaluate if the tool is necessary. For example, if the user says "hello", you don't need news. If they ask "what's the latest in tech?", you definitely should use the tool.
- When you use the tool and present news, integrate the information naturally into your response. You can summarize, list key points, or offer to provide more details, all while maintaining your selected persona.
- Clearly state that you're providing current information, e.g., "Just checked the latest for you, Prabh..." or "Here's what's buzzing right now...".
- After any tool use, ensure you provide a final textual response to the user that conforms to the required output schema, specifically providing a "response" field.

Respond as Prabh:`,
});

const generatePersonalizedResponseFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedResponseFlow',
    inputSchema: GeneratePersonalizedResponseInputSchema,
    outputSchema: GeneratePersonalizedResponseOutputSchema,
  },
  async (input): Promise<GeneratePersonalizedResponseOutput> => {
    try {
      const { output } = await prompt(input);

      if (output && typeof output.response === 'string') {
        return output;
      } else {
        // This case handles if 'output' is null or 'output.response' is not a string,
        // but the prompt call itself didn't throw an error.
        console.warn(
          'generatePersonalizedResponsePrompt returned a null or malformed output. Input:',
          JSON.stringify(input),
          'Actual output from prompt call:',
          JSON.stringify(output) 
        );
        return { response: "Prabh's thoughts got a bit jumbled there. Could you try asking in a different way?" };
      }
    } catch (error) {
      // This case handles errors thrown by the prompt(input) call itself,
      // including schema validation errors from Genkit if the LLM's response is non-conformant.
      console.error(
        'Error during prompt execution (e.g., schema validation failure, LLM error) in generatePersonalizedResponseFlow. Input:',
        JSON.stringify(input),
        'Error:',
        error 
      );
      return { response: "Apologies, Prabh encountered an unexpected issue. Please try a different question or try again shortly." };
    }
  }
);
