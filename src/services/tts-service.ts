
// src/services/tts-service.ts
'use server';

import { robustCall } from '@/lib/robust-call';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Changed to a common default voice for testing. User might need to provide their preferred valid voice ID.
const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Common Voice)
const ELEVENLABS_API_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

interface ElevenLabsErrorResponse {
  detail: {
    status: string;
    message: string;
    // ... other error fields
  } | string; // Sometimes detail is just a string
}

// Internal function to be wrapped by robustCall
async function _generateSpeechInternal(
  text: string,
  voiceId: string = ELEVENLABS_VOICE_ID,
  stability: number = 0.7,
  similarityBoost: number = 0.75
): Promise<{ audioUrl: string }> { // Changed return type to expect audioUrl on success
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key is not configured. robustCall will not be attempted.');
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
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2', // Or other suitable model
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
         errorMessage += `: ${await response.text()}`; // Fallback to raw text
      }
    } catch (e) {
      errorMessage += `: ${await response.text()}`; // Fallback if parsing errorData fails
    }
    console.error(errorMessage);
    throw new Error(errorMessage); // Throw error for robustCall to catch
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  return { audioUrl };
}


export async function generateSpeech(
  text: string,
  voiceId: string = ELEVENLABS_VOICE_ID,
  stability: number = 0.7, 
  similarityBoost: number = 0.75 
): Promise<{ audioUrl?: string; error?: string }> {
  try {
    const result = await robustCall(
      _generateSpeechInternal,
      [text, voiceId, stability, similarityBoost] as [string, string, number, number],
      3, // retries
      1200 // initialDelayMs, slightly higher for potentially slower TTS API
    );
    return { audioUrl: result.audioUrl };
  } catch (error: any) {
    console.error('All attempts to generate speech from ElevenLabs failed after retries:', error.message);
    return { error: `TTS generation failed: ${error.message || 'Unknown error after retries'}` };
  }
}
