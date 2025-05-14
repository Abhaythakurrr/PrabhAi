// src/ai/flows/generate-app-from-description.ts
'use server';

/**
 * @fileOverview Flow to generate a basic app project structure and code snippets based on a user description.
 *
 * - generateAppFromDescription - A function that generates a basic app project structure and code snippets.
 * - GenerateAppInput - The input type for the generateAppFromDescription function.
 * - GenerateAppOutput - The return type for the generateAppFromDescription function.
 */

import {ai} from '@/ai/genkit';
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
    .describe('A string representation of the project structure.'),
  codeSnippets: z
    .string()
    .describe('Example code snippets for key parts of the application.'),
});
export type GenerateAppOutput = z.infer<typeof GenerateAppOutputSchema>;

export async function generateAppFromDescription(input: GenerateAppInput): Promise<GenerateAppOutput> {
  return generateAppFromDescriptionFlow(input);
}

const generateAppPrompt = ai.definePrompt({
  name: 'generateAppPrompt',
  input: {schema: GenerateAppInputSchema},
  output: {schema: GenerateAppOutputSchema},
  prompt: `You are an expert software architect who specializes in generating initial project structures and code for new applications.

  Based on the user's description, generate a basic project structure, including directory names and file names.

  Also generate example code snippets for key parts of the application, such as the main component and any necessary API calls.

  Description: {{{appDescription}}}
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
