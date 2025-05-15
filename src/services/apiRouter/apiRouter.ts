'use server';

import { robustCall } from '@/lib/robust-call'; // Adjusted path based on existing location
import { callOpenRouter, callEdenAI, callGemini, callTogetherAI, callAIML, type LLMProviderResponse } from "./providers/llmProviders";
import { callElevenLabs, callEdenTTS, type TTSProviderResponse } from "./providers/ttsProviders";
import { callWhisper, callEdenSTT, type STTProviderResponse } from "./providers/sttProviders";
import { callGeminiVision, callEdenVision, callHuggingFaceVision, type VisionProviderResponse } from "./providers/visionProviders";
import type { GeneratePersonalizedResponseInput } from '@/ai/flows/generate-personalized-response';

// Routing priorities (can be moved to a config file later)
const LLM_ROUTING_PROVIDERS = [callOpenRouter, callEdenAI, callGemini, callTogetherAI, callAIML];
const TTS_ROUTING_PROVIDERS = [callElevenLabs, callEdenTTS]; // Note: callElevenLabs currently calls existing service
const STT_ROUTING_PROVIDERS = [callWhisper, callEdenSTT];
const VISION_ROUTING_PROVIDERS = [callGeminiVision, callEdenVision, callHuggingFaceVision];

export async function routeLLM(prompt: string, context?: GeneratePersonalizedResponseInput): Promise<LLMProviderResponse> {
  for (const providerFn of LLM_ROUTING_PROVIDERS) {
    try {
      // Pass context to provider functions that might use it (like callOpenRouter example)
      const response = await robustCall(providerFn as any, [prompt, context]); 
      if (response && response.success) { // Assuming provider functions return a structured response
        console.log(`[routeLLM] Success with ${response.providerName}`);
        return response;
      }
      // If response.success is false, it's treated as a failure by robustCall's standards if not thrown.
      // robustCall expects the called function to throw on failure for retry logic.
      // So provider functions should throw if they can't fulfill the request after their own internal logic.
    } catch (e: any) {
      console.warn(`[routeLLM] Provider ${providerFn.name} failed: ${e.message}`);
    }
  }
  console.error("[routeLLM] All LLM providers failed.");
  return { success: false, error: "All LLM providers failed.", providerName: "RouterFallback" };
}

export async function routeTTS(text: string): Promise<TTSProviderResponse> {
  for (const providerFn of TTS_ROUTING_PROVIDERS) {
    try {
      const response = await robustCall(providerFn as any, [text]);
      if (response && response.success) {
        console.log(`[routeTTS] Success with ${response.providerName}`);
        return response;
      }
    } catch (e: any) {
      console.warn(`[routeTTS] Provider ${providerFn.name} failed: ${e.message}`);
    }
  }
  console.error("[routeTTS] All TTS providers failed.");
  return { success: false, error: "All TTS providers failed.", providerName: "RouterFallback" };
}

export async function routeSTT(audioBlob: Blob): Promise<STTProviderResponse> {
  for (const providerFn of STT_ROUTING_PROVIDERS) {
    try {
      const response = await robustCall(providerFn as any, [audioBlob]);
      if (response && response.success) {
        console.log(`[routeSTT] Success with ${response.providerName}`);
        return response;
      }
    } catch (e: any) {
      console.warn(`[routeSTT] Provider ${providerFn.name} failed: ${e.message}`);
    }
  }
  console.error("[routeSTT] All STT providers failed.");
  return { success: false, error: "All STT providers failed.", providerName: "RouterFallback" };
}

export async function routeVision(imageData: any): Promise<VisionProviderResponse> {
  for (const providerFn of VISION_ROUTING_PROVIDERS) {
    try {
      const response = await robustCall(providerFn as any, [imageData]);
      if (response && response.success) {
        console.log(`[routeVision] Success with ${response.providerName}`);
        return response;
      }
    } catch (e: any) {
      console.warn(`[routeVision] Provider ${providerFn.name} failed: ${e.message}`);
    }
  }
  console.error("[routeVision] All vision providers failed.");
  return { success: false, error: "All vision providers failed.", providerName: "RouterFallback" };
}

// Example Image Generation Router (can be expanded)
// import { callStabilityAI, callEdenImageGen } from "./providers/imageGenProviders"; // Assuming these exist
// const IMAGE_GEN_ROUTING_PROVIDERS = [callStabilityAI, callEdenImageGen];
// export async function routeImageGen(description: string): Promise<ImageGenProviderResponse> { ... }
