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
import {z} from 'genkit';

const GeneratePersonalizedResponseInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  persona: z.string().describe('The selected persona of the AI assistant.'),
  pastInteractions: z.string().describe('The past interactions with the user.'),
});
export type GeneratePersonalizedResponseInput = z.infer<
  typeof GeneratePersonalizedResponseInputSchema
>;

const GeneratePersonalizedResponseOutputSchema = z.object({
  response: z.string().describe('The personalized response from the AI assistant.'),
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
  input: {schema: GeneratePersonalizedResponseInputSchema},
  output: {schema: GeneratePersonalizedResponseOutputSchema},
  prompt: `You are an AI assistant with the persona: {{{persona}}}.

You will use the past interactions with the user to generate a personalized response.

Past Interactions: {{{pastInteractions}}}

User Input: {{{userInput}}}

Response: `,
});

const generatePersonalizedResponseFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedResponseFlow',
    inputSchema: GeneratePersonalizedResponseInputSchema,
    outputSchema: GeneratePersonalizedResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
