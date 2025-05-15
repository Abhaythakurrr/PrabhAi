
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
import {getSystemPrompt} from '@/ai/persona';
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
  // System prompt is now generated dynamically in the flow
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
  async (input): Promise<GenerateAppOutput> => {
    const systemMessage = getSystemPrompt("Prabh - AI Studio Architect", `User is in Prabh AI Studio and wants to generate an app outline for: ${input.appDescription}`);
    try {
      const {output} = await generateAppPrompt({
        system: systemMessage,
        ...input
      });
      if (output && output.projectStructure && output.codeSnippets && output.projectStructure.trim() !== "" && output.codeSnippets.trim() !== "") {
        return output;
      }
      console.warn(
        'generateAppPrompt returned a malformed or empty output. Input:',
        JSON.stringify(input),
        'System Message:', systemMessage,
        'Actual output from prompt call:',
        JSON.stringify(output)
      );
      return { 
        projectStructure: "// Prabh's blueprint circuits are a bit fuzzy on this one. Try rephrasing your app idea?",
        codeSnippets: "// No code snippets could be conjured this time. Perhaps a different angle on your description?"
      };
    } catch (error: any) {
      console.error(
        'Error during generateAppFromDescriptionFlow execution. Input:',
        JSON.stringify(input),
        'System Message:', systemMessage,
        'Error:',
        error
      );
      let structureMessage = "// Prabh encountered an unexpected glitch sketching the project structure.";
      let snippetsMessage = "// Code snippet generation also hit a snag.";
      if (error.message && error.message.includes('Schema validation failed')) {
         structureMessage = "// Prabh got the ideas, but structuring them into a blueprint failed. Try a more specific description!";
         snippetsMessage = "// The code snippets couldn't be formatted correctly based on the current idea.";
      }
      return { 
        projectStructure: structureMessage,
        codeSnippets: snippetsMessage
      };
    }
  }
);
