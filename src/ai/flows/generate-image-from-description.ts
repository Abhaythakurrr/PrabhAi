
'use server';

/**
 * @fileOverview Image generation flow from a text description.
 *
 * - generateImageFromDescription - A function that generates an image from a text description.
 * - GenerateImageFromDescriptionInput - The input type for the generateImageFromDescription function.
 * - GenerateImageFromDescriptionOutput - The return type for the generateImageFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromDescriptionInputSchema = z.object({
  description: z.string().describe('The description of the image to generate.'),
});
export type GenerateImageFromDescriptionInput = z.infer<typeof GenerateImageFromDescriptionInputSchema>;

const GenerateImageFromDescriptionOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI, or a placeholder URL if generation failed.'),
  success: z.boolean().describe('Indicates if the image generation was successful.'),
  errorMessage: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateImageFromDescriptionOutput = z.infer<typeof GenerateImageFromDescriptionOutputSchema>;

export async function generateImageFromDescription(input: GenerateImageFromDescriptionInput): Promise<GenerateImageFromDescriptionOutput> {
  return generateImageFromDescriptionFlow(input);
}

const generateImageFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateImageFromDescriptionFlow',
    inputSchema: GenerateImageFromDescriptionInputSchema,
    outputSchema: GenerateImageFromDescriptionOutputSchema,
  },
  async (input): Promise<GenerateImageFromDescriptionOutput> => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: input.description,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      if (media && media.url) {
        return {imageDataUri: media.url, success: true};
      }
      // Fallthrough if media or media.url is unexpectedly null/undefined
      const errorMessage = "Image data was not returned by the AI despite a successful call structure.";
      console.warn(`Image generation issue for input "${input.description}": ${errorMessage}`);
      return {imageDataUri: 'https://placehold.co/600x400.png', success: false, errorMessage: errorMessage};
    } catch (error: any) {
      const errorMessage = `AI image generation failed: ${error.message || 'Unknown error'}`;
      console.error(`Error during image generation in generateImageFromDescriptionFlow. Input "${input.description}":`, error);
      // Return a placeholder if the API call fails
      return {imageDataUri: 'https://placehold.co/600x400.png', success: false, errorMessage: errorMessage};
    }
  }
);
