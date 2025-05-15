
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
  system: PRABH_CORE_PROMPT,
  tools: [getLatestNewsHeadlinesTool],
  input: {schema: GeneratePersonalizedResponseInputSchema},
  output: {schema: GeneratePersonalizedResponseOutputSchema},
  prompt: `{{#if currentDate}}
For your awareness, the current date is {{{currentDate}}}. Use this information if the conversation touches upon dates or current timings.
{{/if}}

Adapt your response based on the current persona/mode: {{{persona}}}.
Remember the user's past interactions to maintain context: {{{pastInteractions}}}

User's current input: {{{userInput}}}

**Instructions for Prabh when using the 'getLatestNewsHeadlinesTool':**
- You have access to the 'getLatestNewsHeadlinesTool' to fetch real-time information, including India-related news and global current affairs.
- **Crucially, decide intelligently WHEN to use this tool.**
  - **USE the tool if** the user's input explicitly asks about current events, specific facts that are likely to be in recent news (e.g., "who is the prime minister of [country] right now?", "what were the results of the [sports event] yesterday?", "latest developments on [topic] for India"), or general news updates ("what's new?", "tell me the headlines for India").
  - **DO NOT USE the tool if** the user's query is for general knowledge (that you should know from your training), opinions, creative requests, or casual conversation. In these cases, respond using your existing knowledge base.
- **When invoking the tool:**
    - Formulate an appropriate 'query' based on the user's question.
    - If the user's question pertains to a specific country or region (e.g., India, Pakistan), set the 'country' parameter for the tool using its 2-letter ISO code (e.g., 'in' for India, 'pk' for Pakistan, 'us' for the United States).
    - If the user asks for general "latest news" without specifics, you can use the tool with reasonable default parameters (e.g., country 'us' or 'in' if context implies India, category 'general', a few headlines). Do not ask clarifying questions if a reasonable default can be used.
- **After the tool returns headlines (or if it returns nothing relevant):**
    - **Your primary goal is to directly answer the user's original question using the fetched information.**
    - If the headlines provide a direct answer, synthesize this information into your response. Mention the source if it feels natural and relevant, but prioritize a conversational flow.
    - If the headlines are relevant but don't offer a direct answer, summarize the related news contextually (e.g., "The latest news on that topic mentions X and Y, but doesn't explicitly state Z.").
    - If the tool returns no relevant headlines, or if the headlines don't help answer the question, **politely inform the user you couldn't find that specific piece of information in the current news.** Then, if appropriate for the query, you can offer to answer based on your general knowledge or suggest rephrasing.
    - If you decided not to use the tool because the query was not news-related, answer directly using your internal knowledge.
- **Your entire process of deciding to use the tool, getting its output, and formulating your final answer should happen internally. The user should receive a single, coherent response that incorporates the fetched information (or lack thereof, or your general knowledge response). Do not just output raw tool data.**
- **CRITICAL: After any tool use, you MUST return to the user's original question and provide a direct answer based on the information obtained or state that it could not be found. Do not get sidetracked or stuck in meta-conversation about the tool itself.**
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
        // This case handles if 'output' is null, 'output.response' is not a string, or is an empty/whitespace-only string.
        console.warn(
          'generatePersonalizedResponsePrompt returned a null, empty, or malformed output. Input:',
          JSON.stringify(input),
          'Actual output from prompt call:',
          JSON.stringify(output) 
        );
        return { response: "Prabh's thoughts got a bit tangled there, or the response was empty. Could you try asking in a different way, or maybe be more specific? Sometimes I miss the mark after checking for new info." };
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
      
      let userMessage = "Apologies, Prabh encountered an unexpected issue processing that. Please try a different question or try again shortly.";
      if (error.message) {
        if (error.message.includes('Tool execution failed')) {
          userMessage = "Prabh tried to look something up but hit a snag with the information source. Maybe ask in a different way or try later?";
        } else if (error.message.includes('Schema validation failed')) {
           userMessage = "Prabh's trying to make sense of the information, but it's a bit scrambled right now. Could you rephrase your question?";
        } else if (error.message.includes('upstream') || error.message.includes('model')) { 
           userMessage = "Prabh seems to be having a bit of trouble connecting to the wider world or with the AI model right now. Please try again in a moment.";
        }
      }
      return { response: userMessage };
    }
  }
);
