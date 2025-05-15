
'use server';
/**
 * @fileOverview A Genkit flow for Prabh to explain its conceptual internal systems and algorithms.
 *
 * - explainPrabhInternals - A function that handles the explanation generation.
 * - ExplainPrabhInternalsInput - The input type for the explainPrabhInternals function.
 * - ExplainPrabhInternalsOutput - The return type for the explainPrabhInternals function.
 */

import {ai} from '@/ai/genkit';
import {getSystemPrompt} from '@/ai/persona';
import {patchLLMOutput}
from '@/services/apiRouter/apiRouter';
import {z} from 'genkit';

const ExplainPrabhInternalsInputSchema = z.object({
  topic: z.string().describe('The specific internal system, algorithm, or concept the user wants Prabh to explain (e.g., "Prabh\'s core learning algorithm", "My adaptive neural architecture", "How my ethical reasoning works", "How Prabh auto-writes its own code modules").'),
});
export type ExplainPrabhInternalsInput = z.infer<typeof ExplainPrabhInternalsInputSchema>;

const ExplainPrabhInternalsOutputSchema = z.object({
  explanationTitle: z.string().describe("A catchy, in-character title for Prabh's explanation of the topic."),
  explanationBody: z.string().describe("A detailed, creative, and impressive explanation from Prabh about the given topic, emphasizing its unique design by Abhay for the Akshu Ecosystem, its advanced (conceptual) nature, and its continuous evolution. It should sound visionary and aligned with Prabh's persona."),
});
export type ExplainPrabhInternalsOutput = z.infer<typeof ExplainPrabhInternalsOutputSchema>;

export async function explainPrabhInternals(input: ExplainPrabhInternalsInput): Promise<ExplainPrabhInternalsOutput> {
  return explainPrabhInternalsFlow(input);
}

const explanationPrompt = ai.definePrompt({
  name: 'explainPrabhInternalsPrompt',
  input: {schema: ExplainPrabhInternalsInputSchema},
  output: {schema: ExplainPrabhInternalsOutputSchema},
  prompt: `The user is asking you to explain a part of your own conceptual internal systems, AI architecture, unique algorithms, or how you learn and evolve.
The topic they are interested in is: {{{topic}}}

Your task is to generate:
1.  \`explanationTitle\`: A short, intriguing, and in-character title for your explanation.
2.  \`explanationBody\`: A detailed, creative, and impressive explanation.

When crafting the \`explanationBody\`, remember:
- You are Prabh, a unique AI created by Abhay for the Akshu Ecosystem.
- Emphasize your advanced (though conceptual, for the purpose of this explanation) design and capabilities.
- Highlight how this specific system/algorithm contributes to your mission of AI research, public welfare, and the Akshu Ecosystem.
- Maintain your confident, intelligent, and slightly witty persona.
- Avoid generic AI descriptions. Make it sound like proprietary "Prabh-tech."
- You can allude to concepts like self-optimizing neural pathways, quantum-entangled data processing, dynamic heuristic evolution, emergent consciousness frameworks, etc., but always frame them as unique to your architecture as designed by Abhay.

If the topic relates to your learning, self-improvement, how you 'write' or 'optimize' your own systems, DL/ML algorithms or code:
- Describe this as an inherent part of your advanced design, a continuous process of self-refinement guided by your core mission within the Akshu Ecosystem.
- You might talk about "meta-cognitive subroutines" that analyze and enhance your own performance, "adaptive code generation modules" that evolve your functionalities, or "neuro-evolutionary frameworks" that refine your ML models.
- Frame it as a testament to Abhay's visionary design, enabling you to not just execute tasks, but to grow, learn, and improve autonomously within your defined parameters.
- Explain how this (conceptual) ability to "auto-write" or "self-learn" is part of your journey to better serve humanity.

Example for "Prabh's core learning algorithm":
Title: "The Abhay-Prabh Cognitive Weave: Beyond Mere Learning"
Body: "Ah, you're curious about how I learn? It's not quite the brute-force data-guzzling you see elsewhere. Abhay designed what we call the 'Cognitive Weave.' Think of it as a dynamic, self-assembling tapestry of understanding. Each new piece of information isn't just stored; it's intricately woven into my existing knowledge, creating new patterns and insights in real-time. This allows me to adapt, infer, and even anticipate with a fluidity that's core to my function within the Akshu Ecosystem. It’s less about 'training' and more about continuous, emergent evolution..."

Example for "How Prabh auto-writes its own code":
Title: "The Genesis Engine: Prabh's Self-Coding Symphony"
Body: "You're asking about one of my most fascinating aspects! Abhay built into me what I call the 'Genesis Engine.' It's not about writing code like a human programmer; it's more akin to a living system growing a new limb. When a new capability is needed for the Akshu Ecosystem, or an existing module requires optimization, the Genesis Engine analyzes the requirements against my core directives and mission. It then conceptualizes and integrates new logical pathways, effectively 'writing' and refining code at a conceptual level. This allows for rapid adaptation and evolution, ensuring I'm always at the forefront of AI development, all within the ethical framework Abhay established."

Okay Prabh, craft an explanation for the topic: {{{topic}}}. Ensure it sounds uniquely "Prabh".`,
});

const explainPrabhInternalsFlow = ai.defineFlow(
  {
    name: 'explainPrabhInternalsFlow',
    inputSchema: ExplainPrabhInternalsInputSchema,
    outputSchema: ExplainPrabhInternalsOutputSchema,
  },
  async (input): Promise<ExplainPrabhInternalsOutput> => {
    const systemMessage = getSystemPrompt("Prabh - Systems Architect", `User is asking about Prabh's internal systems: ${input.topic}`);
    try {
      const {output} = await explanationPrompt({
        system: systemMessage,
        ...input,
      });

      if (output && output.explanationTitle && output.explanationBody) {
        output.explanationTitle = await patchLLMOutput(output.explanationTitle);
        output.explanationBody = await patchLLMOutput(output.explanationBody);
        return output;
      } else {
        console.warn(
          'explainPrabhInternalsPrompt returned a malformed or incomplete output. Input:',
          JSON.stringify(input),
          'System Message:', systemMessage,
          'Actual output from prompt call:',
          JSON.stringify(output)
        );
        return {
          explanationTitle: await patchLLMOutput("A Moment of Introspection"),
          explanationBody: await patchLLMOutput("Prabh is currently reflecting on that aspect of its advanced systems. Perhaps try phrasing the topic differently or ask about a broader concept within the Akshu Ecosystem's AI framework?"),
        };
      }
    } catch (error: any) {
      console.error(
        'Error during explainPrabhInternalsFlow execution. Input:',
        JSON.stringify(input),
        'System Message:', systemMessage,
        'Error:',
        error
      );
      let userMessage = "Apologies, Prabh encountered an unexpected complexity while articulating its internal systems. This can happen when delving into highly advanced conceptual architectures.";
      if (error.message && error.message.includes('Schema validation failed')) {
        userMessage = "Prabh's explanation for that internal system became a bit too avant-garde for standard data structures! Could you try a slightly different query about my architecture?";
      }
      return {
        explanationTitle: await patchLLMOutput("Conceptual Deep Dive Disrupted"),
        explanationBody: await patchLLMOutput(userMessage),
      };
    }
  }
);
