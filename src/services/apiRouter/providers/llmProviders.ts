
'use server';

import type { GeneratePersonalizedResponseInput } from "@/ai/flows/generate-personalized-response";
import { getSystemPrompt } from "@/ai/persona";

export interface LLMProviderResponse {
  success: boolean;
  content?: string;
  error?: string;
  providerName: string;
}

export async function callOpenRouter(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OpenRouter API key is not set.");
    return { success: false, error: "OpenRouter API key not configured.", providerName: "OpenRouter" };
  }

  const systemMessage = context ? getSystemPrompt(context.persona, context.pastInteractions) : getSystemPrompt("Prabh (Neutral)", "General query");
  
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002", 
      "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "PrabhAI", 
    },
    body: JSON.stringify({
      model: "mistralai/mixtral-8x7b-instruct", // Updated to a more powerful model
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`OpenRouter API error (${res.status}): ${errorBody}`);
    throw new Error(`OpenRouter request failed with status ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.warn("OpenRouter returned no content in choices[0].message.content", data);
    throw new Error("OpenRouter returned no content.");
  }
  return { success: true, content, providerName: "OpenRouter" };
}

export async function callEdenAI(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  console.log("Attempting to call EdenAI (LLM) with prompt:", prompt);
  // const apiKey = process.env.EDEN_AI_API_KEY;
  // if (!apiKey) return { success: false, error: "EdenAI API key not configured.", providerName: "EdenAI" };
  // const systemMessage = context ? getSystemPrompt(context.persona, context.pastInteractions) : getSystemPrompt("Prabh (Neutral)", "General query");
  // ... actual API call logic for EdenAI LLM
  throw new Error('Provider EdenAI (LLM) not implemented');
  // return { success: false, error: "EdenAI (LLM) not implemented", providerName: "EdenAI (LLM)" };
}

export async function callGemini(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  console.log("Attempting to call Gemini (LLM) via Genkit with prompt:", prompt);
  // This would typically involve using the existing Genkit `ai.generate` or a specific Genkit flow.
  // For direct integration here, you might call a Genkit flow, or if Genkit instance is available:
  // import { ai } from '@/ai/genkit'; // Assuming ai is accessible
  // const systemMessage = context ? getSystemPrompt(context.persona, context.pastInteractions) : getSystemPrompt("Prabh (Neutral)", "General query");
  // try {
  //   const { text } = await ai.generate({ prompt: [{role: 'system', content: systemMessage}, {role: 'user', content: prompt}] });
  //   if (text) {
  //     return { success: true, content: text, providerName: "Gemini (Genkit)" };
  //   }
  //   throw new Error("Gemini (Genkit) returned no text.");
  // } catch (error: any) {
  //   console.error("Error calling Gemini (Genkit) LLM:", error);
  //   throw error; // Re-throw for robustCall
  // }
  throw new Error('Provider Gemini (LLM) not implemented in router. Use Genkit flows.');
}

export async function callTogetherAI(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  console.log("Attempting to call TogetherAI (LLM) with prompt:", prompt);
  // const apiKey = process.env.TOGETHER_AI_API_KEY;
  // if (!apiKey) return { success: false, error: "TogetherAI API key not configured.", providerName: "TogetherAI" };
  // const systemMessage = context ? getSystemPrompt(context.persona, context.pastInteractions) : getSystemPrompt("Prabh (Neutral)", "General query");
  // ... actual API call logic
  throw new Error('Provider TogetherAI (LLM) not implemented');
}

export async function callAIML(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  console.log("Attempting to call AIMLapi.com (LLM) with prompt:", prompt);
  // const apiKey = process.env.AIML_API_KEY;
  // if (!apiKey) return { success: false, error: "AIML API key not configured.", providerName: "AIML" };
  // const systemMessage = context ? getSystemPrompt(context.persona, context.pastInteractions) : getSystemPrompt("Prabh (Neutral)", "General query");
  // ... actual API call logic
  throw new Error('Provider AIMLapi.com (LLM) not implemented');
}
