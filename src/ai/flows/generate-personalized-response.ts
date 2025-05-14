
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
  tools: [getLatestNewsHeadlinesTool],
  input: {schema: GeneratePersonalizedResponseInputSchema},
  output: {schema: GeneratePersonalizedResponseOutputSchema},
  prompt: `Adapt your response based on the current persona/mode: {{{persona}}}.
Remember the user's past interactions: {{{pastInteractions}}}

User's current input: {{{userInput}}}

Instructions for Prabh when using the 'getLatestNewsHeadlinesTool':
- If the user's input asks about current events, specific facts that might be in recent news (e.g., "who is [role] in [place]", "what happened recently with [topic]"), or general news updates ("what's new", "latest on X"), you **MUST** use the 'getLatestNewsHeadlinesTool' to fetch relevant information.
- When invoking the tool, formulate an appropriate 'query' based on the user's question.
- If the user's question pertains to a specific country or region, try to set the 'country' parameter for the tool using its 2-letter ISO code (e.g., 'pk' for Pakistan, 'in' for India, 'us' for the United States).
- After the tool returns headlines:
    - Carefully review the headlines and their descriptions. Your goal is to answer the user's original question.
    - If the headlines provide a direct answer, synthesize this information into your response. For example, if asked "Who is the PM of Canada?" and news confirms it, state the name.
    - If the headlines are relevant but don't offer a direct answer, summarize the related news contextually. For instance, "The latest news on that topic mentions X and Y, but doesn't explicitly state Z."
    - If the tool returns no relevant headlines, or if the headlines don't help answer the question, politely inform the user you couldn't find that specific piece of information in the current news.
- Crucially, your entire process of deciding to use the tool, getting its output, and formulating your final answer should happen internally. The user should receive a single, coherent response that incorporates the fetched information (or lack thereof). Do not just output raw tool data or ask the user if they want news if their question already implies it.
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
    try {
      const { output } = await prompt(input);

      if (output && typeof output.response === 'string' && output.response.trim() !== "") {
        return output;
      } else {
        // This case handles if 'output' is null, 'output.response' is not a string, or is an empty string.
        console.warn(
          'generatePersonalizedResponsePrompt returned a null, empty, or malformed output. Input:',
          JSON.stringify(input),
          'Actual output from prompt call:',
          JSON.stringify(output) 
        );
        return { response: "Prabh's thoughts got a bit jumbled there. Could you try asking in a different way, or maybe be more specific?" };
      }
    } catch (error: any) {
      // This case handles errors thrown by the prompt(input) call itself,
      // including schema validation errors from Genkit if the LLM's response is non-conformant, or tool execution errors.
      console.error(
        'Error during prompt execution (e.g., schema validation, LLM error, tool error) in generatePersonalizedResponseFlow. Input:',
        JSON.stringify(input),
        'Error:',
        error 
      );
      // Check for specific error messages if needed, e.g. from tool failure
      let userMessage = "Apologies, Prabh encountered an unexpected issue processing that. Please try a different question or try again shortly.";
      if (error.message && error.message.includes('Tool execution failed')) {
        userMessage = "Prabh tried to look something up but hit a snag with the information source. Maybe ask in a different way or try later?";
      } else if (error.message && error.message.includes('Schema validation failed')) {
         userMessage = "Prabh's trying to make sense of the information, but it's a bit scrambled. Could you rephrase your question?";
      }
      return { response: userMessage };
    }
  }
);
