
'use server';

import { robustCall } from '@/lib/robust-call'; // Corrected path

export interface TTSProviderResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
  providerName: string;
}

const ELEVENLABS_VOICE_ID = 'ZpjnZHRyF5OHsFJDCnJ9'; // Default female voice
const ELEVENLABS_API_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

interface ElevenLabsErrorResponse {
  detail: {
    status: string;
    message: string;
  } | string;
}

async function _callElevenLabsInternal(
  text: string,
  voiceId: string = ELEVENLABS_VOICE_ID,
  stability: number = 0.7,
  similarityBoost: number = 0.75
): Promise<string> { // Returns audioUrl string on success
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ElevenLabs API key is not configured.');
    throw new Error('TTS service not configured (API key missing).');
  }
  if (!text.trim()) {
    throw new Error('Cannot generate speech for empty text.');
  }

  const url = `${ELEVENLABS_API_BASE_URL}/${voiceId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: stability,
        similarity_boost: similarityBoost,
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = `ElevenLabs API error (${response.status})`;
    try {
      const errorData: ElevenLabsErrorResponse = await response.json();
      if (typeof errorData.detail === 'string') {
        errorMessage += `: ${errorData.detail}`;
      } else if (errorData.detail && errorData.detail.message) {
        errorMessage += `: ${errorData.detail.message}`;
      } else {
         errorMessage += `: ${await response.text()}`;
      }
    } catch (e) {
      errorMessage += `: ${await response.text()}`;
    }
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

export async function callElevenLabs(text: string): Promise<TTSProviderResponse> {
  console.log("Attempting to call ElevenLabs with text via router:", text);
  try {
    // robustCall is used here internally for this specific provider's fetch logic
    const audioUrl = await robustCall(
      _callElevenLabsInternal,
      [text, ELEVENLABS_VOICE_ID, 0.7, 0.75] as [string, string, number, number],
      2, // Fewer retries for TTS as it might be more sensitive or costly
      1000
    );
    return { success: true, audioUrl, providerName: "ElevenLabs" };
  } catch (error: any) {
    // This catch is for errors from robustCall if all internal retries for _callElevenLabsInternal fail
    console.error(`ElevenLabs call failed after retries: ${error.message}`);
    // For the main router, the provider function itself should throw if it cannot fulfill.
    // However, since robustCall is *inside* this provider, we re-throw so the main router's robustCall can catch it.
    // Or, we can decide that callElevenLabs itself returns a ProviderResponse. For consistency with robustCall handling in the main router,
    // this function should throw if its own robustCall fails.
    // Let's adjust: if robustCall fails, it throws. This function should then be wrapped by robustCall in the main router.
    // For this iteration, I'll keep robustCall internal to this provider for TTS.
    // If robustCall for _callElevenLabsInternal fails, it throws an error.
    // The router's robustCall around callElevenLabs will catch this.
    // The console.error above is sufficient. Let the error propagate to the main router's robustCall.
    throw error; // Re-throw for the main router's robustCall
  }
}


export async function callEdenTTS(text: string): Promise<TTSProviderResponse> {
  console.log("Attempting to call EdenTTS with text:", text);
  // const apiKey = process.env.EDEN_AI_API_KEY;
  // if (!apiKey) return { success: false, error: "EdenAI API key not configured for TTS.", providerName: "EdenTTS" };
  // ... actual API call logic
  throw new Error('Provider EdenTTS not implemented');
}
