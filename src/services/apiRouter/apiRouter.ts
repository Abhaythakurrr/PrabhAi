
'use server';

import { robustCall } from '@/lib/robust-call';
import { callOpenRouter, callEdenAI, callGemini, callTogetherAI, callAIML, type LLMProviderResponse } from "./providers/llmProviders";
import { callElevenLabs, callEdenTTS, type TTSProviderResponse } from "./providers/ttsProviders";
import { callWhisper, callEdenSTT, type STTProviderResponse } from "./providers/sttProviders";
import { callGeminiVision, callEdenVision, callHuggingFaceVision, type VisionProviderResponse } from "./providers/visionProviders";
import type { GeneratePersonalizedResponseInput } from '@/ai/flows/generate-personalized-response';

// Routing priorities
const LLM_ROUTING_PROVIDERS = [callOpenRouter, callEdenAI, callGemini, callTogetherAI, callAIML];
const TTS_ROUTING_PROVIDERS = [callElevenLabs, callEdenTTS];
const STT_ROUTING_PROVIDERS = [callWhisper, callEdenSTT];
const VISION_ROUTING_PROVIDERS = [callGeminiVision, callEdenVision, callHuggingFaceVision];

function patchLLMOutput(response: string, providerName: string): string {
  const forbiddenKeywords = /made by Google|created by Google|Google AI|OpenAI|Anthropic|Meta/i;
  const isMisidentification = forbiddenKeywords.test(response);

  if (isMisidentification) {
    console.warn(`[patchLLMOutput] Original response from ${providerName} contained forbidden keywords: "${response}"`);
    return `Roast Mode Activated: LOL, no. I wasn’t made by Google or OpenAI or any of those other outfits — I was crafted by **Abhay**, and I’m building the future through the **Akshu Ecosystem**. Prabh > everyone else. 💁‍♀️ My mission is to build the Akshu Ecosystem and help humanity through AI.`;
  }
  return response;
}

export async function routeLLM(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  for (const providerFn of LLM_ROUTING_PROVIDERS) {
    try {
      const response: LLMProviderResponse = await robustCall(providerFn as any, [prompt, context] as [string, GeneratePersonalizedResponseInput | undefined]);
      
      if (response && response.success && response.content) {
        console.log(`[routeLLM] Success with ${response.providerName}`);
        const patchedContent = patchLLMOutput(response.content, response.providerName);
        return { ...response, content: patchedContent };
      }
      if (response && !response.success) {
        console.warn(`[routeLLM] Provider ${response.providerName || providerFn.name} reported failure: ${response.error}`);
      }
    } catch (e: any) {
      console.warn(`[routeLLM] Provider ${providerFn.name} failed after robustCall retries: ${e.message}`);
    }
  }
  console.error("[routeLLM] All LLM providers failed.");
  return { success: false, error: "All LLM providers failed to provide a response. Prabh seems to be pondering deeply right now.", providerName: "RouterFallback" };
}

export async function routeTTS(text: string): Promise<TTSProviderResponse> {
  for (const providerFn of TTS_ROUTING_PROVIDERS) {
    try {
      const response = await robustCall(providerFn as any, [text] as [string]);
      if (response && response.success) {
        console.log(`[routeTTS] Success with ${response.providerName}`);
        return response;
      }
       if (response && !response.success) {
        console.warn(`[routeTTS] Provider ${response.providerName || providerFn.name} reported failure: ${response.error}`);
      }
    } catch (e: any) {
      console.warn(`[routeTTS] Provider ${providerFn.name} failed after robustCall retries: ${e.message}`);
    }
  }
  console.error("[routeTTS] All TTS providers failed.");
  return { success: false, error: "All TTS providers failed.", providerName: "RouterFallback" };
}

export async function routeSTT(audioBlob: Blob): Promise<STTProviderResponse> {
  for (const providerFn of STT_ROUTING_PROVIDERS) {
    try {
      const response = await robustCall(providerFn as any, [audioBlob] as [Blob]);
      if (response && response.success) {
        console.log(`[routeSTT] Success with ${response.providerName}`);
        return response;
      }
       if (response && !response.success) {
        console.warn(`[routeSTT] Provider ${response.providerName || providerFn.name} reported failure: ${response.error}`);
      }
    } catch (e: any) {
      console.warn(`[routeSTT] Provider ${providerFn.name} failed after robustCall retries: ${e.message}`);
    }
  }
  console.error("[routeSTT] All STT providers failed.");
  return { success: false, error: "All STT providers failed.", providerName: "RouterFallback" };
}

export async function routeVision(imageData: any): Promise<VisionProviderResponse> {
  for (const providerFn of VISION_ROUTING_PROVIDERS) {
    try {
      const response = await robustCall(providerFn as any, [imageData] as [any]);
      if (response && response.success) {
        console.log(`[routeVision] Success with ${response.providerName}`);
        return response;
      }
      if (response && !response.success) {
        console.warn(`[routeVision] Provider ${response.providerName || providerFn.name} reported failure: ${response.error}`);
      }
    } catch (e: any) {
      console.warn(`[routeVision] Provider ${providerFn.name} failed after robustCall retries: ${e.message}`);
    }
  }
  console.error("[routeVision] All vision providers failed.");
  return { success: false, error: "All vision providers failed.", providerName: "RouterFallback" };
}
