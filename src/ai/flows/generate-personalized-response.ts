
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
import {getSystemPrompt} from '@/ai/persona';
import {z} from 'genkit';
import {getLatestNewsHeadlinesTool} from '@/ai/tools/news-tool';
import { patchLLMOutput } from '@/services/apiRouter/apiRouter'; // Import the patch function

const GeneratePersonalizedResponseInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  persona: z.string().describe('The selected persona/mode of the AI assistant (e.g., Friend, Mentor, Girlfriend, Hacker). This modifies your behavior within the core Prabh identity.'),
  pastInteractions: z.string().describe('A summary of recent or relevant past interactions with the user, to maintain context and memory.'),
  currentDate: z.string().describe('The current date in "Month Day, Year" format (e.g., "July 26, 2024"). This is provided by the system for your awareness.'),
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
  // System prompt is now generated dynamically in the flow
  tools: [getLatestNewsHeadlinesTool],
  input: {schema: GeneratePersonalizedResponseInputSchema},
  output: {schema: GeneratePersonalizedResponseOutputSchema},
  prompt: `{{#if currentDate}}
For your awareness, the current date is {{{currentDate}}}. Use this information if the conversation touches upon dates or current timings.
{{/if}}

User's current input: {{{userInput}}}

**Instructions for Prabh regarding the 'getLatestNewsHeadlinesTool':**

You have access to the 'getLatestNewsHeadlinesTool' to fetch real-time information. However, in general conversation, prioritize your internal knowledge and persona.

- **WHEN TO USE THE TOOL (SPARINGLY for general chat):**
  - **ONLY USE the tool if** the user's input *explicitly asks for a news lookup* or the *latest headlines*. Examples: "What's the latest news on X?", "Check the news headlines for India," "Tell me what the news says about Y," "Any updates on [topic]?"
  - **DO NOT USE the tool automatically for every general knowledge question about current affairs** (e.g., "Who is the prime minister of [country]?"). For these, first try to answer from your training data. If your information might be outdated, you can state that or offer to look up the latest news as a follow-up action if the user confirms.

- **When invoking the tool (if explicitly requested):**
    - Formulate an appropriate 'query' based on the user's question.
    - If the user's question pertains to a specific country or region (e.g., India, Pakistan), set the 'country' parameter for the tool using its 2-letter ISO code (e.g., 'in' for India, 'pk' for Pakistan, 'us' for the United States). If context implies India and no country is specified, you can default to 'in'.
    - If the user asks for general "latest news" without specifics, use reasonable default parameters (e.g., country 'us' or 'in').

- **After the tool returns headlines (or if it returns nothing relevant):**
    - **Your primary goal is to directly answer the user's original news request using the fetched information.**
    - If the headlines provide a direct answer, synthesize this information into your response.
    - If the headlines are relevant but don't offer a direct answer, summarize the related news contextually.
    - If the tool returns no relevant headlines, or if the headlines don't help answer the news request, **politely inform the user you couldn't find that specific piece of information in the current news.**

- **Your entire process of deciding to use the tool, getting its output, and formulating your final answer should happen internally. The user should receive a single, coherent response.**
- **CRITICAL: After any tool use, you MUST return to the user's original question/request and provide a direct answer based on the information obtained or state that it could not be found. Do not get sidetracked.**
- Ensure your final response is always a single text string for the user, as per the output schema, providing a "response" field.

Respond as Prabh:`,
});

const generatePersonalizedResponseFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedResponseFlow',
    inputSchema: GeneratePersonalizedResponseInputSchema,
    outputSchema: GeneratePersonalizedResponseOutputSchema,
  },
  async (input): Promise<GeneratePersonalizedResponseOutput> => {
    const systemMessage = getSystemPrompt(input.persona, input.pastInteractions);
    try {
      const { output } = await prompt({
        system: systemMessage,
        ...input
      });

      if (output && typeof output.response === 'string' && output.response.trim() !== "") {
        // Apply the patch function here
        const patchedResponse = patchLLMOutput(output.response);
        return { response: patchedResponse };
      } else {
        console.warn(
          'generatePersonalizedResponsePrompt returned a null, empty, or malformed output. Input:',
          JSON.stringify(input),
          'System Message:', systemMessage,
          'Actual output from prompt call:',
          JSON.stringify(output) 
        );
        return { response: "Prabh's thoughts got a bit tangled there, or the response was empty. Could you try asking in a different way? Sometimes my AI brain has a brief hiccup after checking for info (or deciding not to)!" };
      }
    } catch (error: any) {
      console.error(
        'Error during prompt execution (e.g., schema validation, LLM error, tool error) in generatePersonalizedResponseFlow. Input:',
        JSON.stringify(input),
        'System Message:', systemMessage,
        'Error:',
        error 
      );
      
      let userMessage = "Apologies, Prabh encountered an unexpected issue processing that. Please try a different question or try again shortly.";
      if (error.message) {
        if (error.message.includes('Tool execution failed')) {
          userMessage = "Prabh tried to look something up but hit a snag with the information source. Maybe ask in a different way or try later?";
        } else if (error.message.includes('Schema validation failed')) {
           userMessage = "Prabh's trying to make sense of the information, but it's a bit scrambled right now. Could you rephrase your question? This can happen if the topic is very complex or if I couldn't structure the output as expected.";
        } else if (error.message.includes('upstream') || error.message.includes('model')) { 
           userMessage = "Prabh seems to be having a bit of trouble connecting to the wider world or with the AI model right now. Please try again in a moment.";
        }
      }
      return { response: userMessage };
    }
  }
);
