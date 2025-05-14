
// src/ai/flows/generate-app-from-description.ts
'use server';

/**
 * @fileOverview Flow to generate a basic app project structure and code snippets based on a user description,
 * as Prabh, using Prabh AI Studio capabilities.
 *
 * - generateAppFromDescription - A function that generates a basic app project structure and code snippets.
 * - GenerateAppInput - The input type for the generateAppFromDescription function.
 * - GenerateAppOutput - The return type for the generateAppFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {PRABH_CORE_PROMPT} from '@/ai/persona';
import {z} from 'genkit';

const GenerateAppInputSchema = z.object({
  appDescription: z
    .string()
    .describe('A detailed description of the app to be generated.'),
});
export type GenerateAppInput = z.infer<typeof GenerateAppInputSchema>;

const GenerateAppOutputSchema = z.object({
  projectStructure: z
    .string()
    .describe('A string representation of the project structure, as proposed by Prabh.'),
  codeSnippets: z
    .string()
    .describe('Example code snippets for key parts of the application, crafted by Prabh.'),
});
export type GenerateAppOutput = z.infer<typeof GenerateAppOutputSchema>;

export async function generateAppFromDescription(input: GenerateAppInput): Promise<GenerateAppOutput> {
  return generateAppFromDescriptionFlow(input);
}

const generateAppPrompt = ai.definePrompt({
  name: 'generateAppPrompt',
  system: PRABH_CORE_PROMPT,
  input: {schema: GenerateAppInputSchema},
  output: {schema: GenerateAppOutputSchema},
  prompt: `You are in Prabh AI Studio mode. A user wants help creating an app.
Your task is to take their description and outline a basic project structure (directories, key files) and provide some example code snippets for the main parts.
Keep it high-level and helpful for getting started.

User's App Description: {{{appDescription}}}

Okay Prabh, sketch out the project structure and some initial code snippets:
`,
});

const generateAppFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateAppFromDescriptionFlow',
    inputSchema: GenerateAppInputSchema,
    outputSchema: GenerateAppOutputSchema,
  },
  async input => {
    const {output} = await generateAppPrompt(input);
    return output!;
  }
);

