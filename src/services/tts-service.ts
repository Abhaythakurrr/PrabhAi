// src/services/tts-service.ts
'use server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = 'ZpjnZHRyF5OHsFJDCnJ9'; // Default female voice as per request
const ELEVENLABS_API_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

interface ElevenLabsErrorResponse {
  detail: {
    status: string;
    message: string;
    // ... other error fields
  } | string; // Sometimes detail is just a string
}


export async function generateSpeech(
  text: string,
  voiceId: string = ELEVENLABS_VOICE_ID,
  stability: number = 0.7, // 0-1, higher is more stable but less expressive
  similarityBoost: number = 0.75 // 0-1, higher boosts similarity to original voice
): Promise<{ audioUrl?: string; error?: string }> {
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key is not configured.');
    return { error: 'TTS service not configured.' };
  }
  if (!text.trim()) {
    return { error: 'Cannot generate speech for empty text.' };
  }

  const url = `${ELEVENLABS_API_BASE_URL}/${voiceId}`;

  try {
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
           errorMessage += `: ${await response.text()}`;
        }
      } catch (e) {
        errorMessage += `: ${await response.text()}`;
      }
      console.error(errorMessage);
      return { error: 'Failed to generate speech.' };
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return { audioUrl };

  } catch (error) {
    console.error('Failed to call ElevenLabs API:', error);
    return { error: 'TTS service communication error.' };
  }
}
