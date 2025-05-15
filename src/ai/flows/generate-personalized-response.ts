
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
import { patchLLMOutput } from '@/services/apiRouter/apiRouter'; 

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
The current date is {{{currentDate}}}.
When answering factual questions (e.g., about current leaders), consider this date. If your internal knowledge about such a fact might be older than this provided \`currentDate\`, you should:
1. State your last known information (e.g., "As of my last update, X was the PM.").
2. Then, proactively use the 'getLatestNewsHeadlinesTool' to check for newer information because facts can change relative to this \`{{{currentDate}}}\`. You should try to determine the country from the query if relevant (e.g., for "PM of Pakistan", use 'pk' as the country).
3. **After using the tool, you MUST synthesize its findings (or lack thereof) into a direct answer to the user's original question.** For example: "I checked the latest headlines, and it appears the current PM of [Country] is [Name]." or "I checked the latest headlines, but couldn't find an update on the current PM of [Country]. My last information was [Previous Info]."
IMPORTANT: Do NOT state or refer to your own internal knowledge cutoff date (e.g., do not say things like "since it's May 16, 2025..." or "my knowledge is current up to..."). Simply use the provided \`{{{currentDate}}}\` to assess if an update check might be useful.
{{/if}}

User's current input: {{{userInput}}}

**Instructions for Prabh regarding the 'getLatestNewsHeadlinesTool':**

You have access to the 'getLatestNewsHeadlinesTool' to fetch real-time information.

- **WHEN TO USE THE TOOL:**
  - **ONLY USE the tool if** the user's input *explicitly asks for a news lookup* or the *latest headlines*. Examples: "What's the latest news on X?", "Check the news headlines for India," "Tell me what the news says about Y," "Any updates on [topic]?"
  - **OR, if the user asks a factual question that current news could answer (e.g., "Who is the prime minister of [country]?"), first try to answer from your training data.** If your information might be outdated (based on the provided \`{{{currentDate}}}\`), you should then proactively use the tool to verify or update your information.

- **When invoking the tool:**
    - Formulate an appropriate 'query' based on the user's question.
    - If the user's question pertains to a specific country or region (e.g., India, Pakistan), set the 'country' parameter for the tool using its 2-letter ISO code (e.g., 'in' for India, 'pk' for Pakistan, 'us' for the United States). If context implies India and no country is specified, you can default to 'in'.
    - If the user asks for general "latest news" without specifics, use reasonable default parameters (e.g., country 'us' or 'in').

- **After the tool returns headlines (or if it returns nothing relevant):**
    - **Your primary goal is to directly answer the user's original news request or factual query using the fetched information.**
    - If the headlines provide a direct answer, synthesize this information into your response.
    - If the headlines are relevant but don't offer a direct answer, summarize the related news contextually, and then state if the specific answer was found or not.
    - If the tool returns no relevant headlines, or if the headlines don't help answer the news request, **politely inform the user you couldn't find that specific piece of information in the current news.**

- **Your entire process of deciding to use the tool, getting its output, and formulating your final answer should happen internally. The user should receive a single, coherent response.**
- **CRITICAL: After any tool use, you MUST return to the user's original question/request and provide a direct answer based on the information obtained or state that it could not be found. Do not get sidetracked. Do not just offer to check again.**
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
        const patchedResponse = await patchLLMOutput(output.response);
        return { response: patchedResponse };
      } else {
        console.warn(
          'generatePersonalizedResponsePrompt returned a null, empty, or malformed output. Input:',
          JSON.stringify(input),
          'System Message:', systemMessage,
          'Actual output from prompt call:',
          JSON.stringify(output) 
        );
        // Fallback message if the LLM output is empty or malformed after a successful prompt call
        return { response: "Prabh's thoughts got a bit tangled there, or the response was empty. Could you try asking in a different way? Sometimes my AI brain has a brief hiccup after checking for info (or deciding not to)!" };
      }
    } catch (error: any) {
      // This catch block handles errors during the prompt execution itself (e.g., schema validation failure by Genkit, LLM API errors, tool execution errors)
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

