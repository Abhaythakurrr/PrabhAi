
'use server';

import { robustCall } from '@/lib/robust-call'; // Adjusted path
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

export async function routeLLM(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  for (const providerFn of LLM_ROUTING_PROVIDERS) {
    try {
      // Pass context to provider functions that might use it
      const response = await robustCall(providerFn as any, [prompt, context] as [string, GeneratePersonalizedResponseInput | undefined]); 
      // robustCall will return the result of providerFn if successful, or throw if all its retries fail.
      // Provider functions are expected to return a ProviderResponse or throw.
      // If robustCall succeeds, it means providerFn succeeded and returned a ProviderResponse.
      if (response && response.success) {
        console.log(`[routeLLM] Success with ${response.providerName}`);
        return response; // This is already a LLMProviderResponse
      }
      // If providerFn returns { success: false, ... }, robustCall passes it through.
      // This case should ideally be handled by providerFn throwing an error instead for robustCall to retry.
      // For this iteration, we assume providerFn throws on failure, or returns success:true.
      // If it returns success:false without throwing, robustCall won't retry, and we'll log and continue.
      if (response && !response.success) {
        console.warn(`[routeLLM] Provider ${response.providerName || providerFn.name} reported failure: ${response.error}`);
      }
    } catch (e: any) {
      console.warn(`[routeLLM] Provider ${providerFn.name} failed after robustCall retries: ${e.message}`);
    }
  }
  console.error("[routeLLM] All LLM providers failed.");
  return { success: false, error: "All LLM providers failed.", providerName: "RouterFallback" };
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
