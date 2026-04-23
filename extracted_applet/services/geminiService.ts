
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { ChatMessage, MessageSender } from '../types';
import { 
  GEMINI_PRO_MODEL, 
  GEMINI_FLASH_MODEL, 
  GEMINI_FLASH_TTS_MODEL, 
  IMAGE_GEN_MODEL, 
  TUTOR_SYSTEM_INSTRUCTION 
} from '../constants';
import { blobToBase64 } from '../utils/audioUtils';

export async function ensureApiKeyAndInstantiateGoogleGenAI() {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || (process as any).env?.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function sendChatMessage(userMessage: string, chatHistory: ChatMessage[]): Promise<string> {
  const ai = await ensureApiKeyAndInstantiateGoogleGenAI();

  const historyForGemini = chatHistory
    .filter(msg => msg.content.type === 'text')
    .map(msg => ({
      role: msg.sender === MessageSender.User ? 'user' : 'model',
      parts: [{ text: (msg.content as any).value }],
    }));

  try {
    const chat = ai.chats.create({
      model: GEMINI_PRO_MODEL,
      config: {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: historyForGemini,
    });

    const response = await chat.sendMessage({
      message: userMessage,
    });

    return response.text || "I'm thinking hard, but no words came out! Let's try again.";
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return `Oh no! My crystal ball got a bit cloudy. Let's try that again, Applesauce!`;
  }
}

export async function generateAudio(text: string): Promise<string> {
  const ai = await ensureApiKeyAndInstantiateGoogleGenAI();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_TTS_MODEL,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    throw new Error('No audio returned');
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const ai = await ensureApiKeyAndInstantiateGoogleGenAI();
  try {
    const base64Audio = await blobToBase64(audioBlob);
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: [{
        parts: [
          { inlineData: { data: base64Audio, mimeType: audioBlob.type } },
          { text: 'Transcribe this audio exactly.' }
        ]
      }],
    });
    return response.text.trim();
  } catch (error) {
    console.error('Transcription Error:', error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const ai = await ensureApiKeyAndInstantiateGoogleGenAI();
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_GEN_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Image not found in response');
  } catch (error) {
    console.error('Image Gen Error:', error);
    throw error;
  }
}

export async function generateCaptionForImage(imagePrompt: string): Promise<string> {
  const ai = await ensureApiKeyAndInstantiateGoogleGenAI();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: `Write a magical one-sentence caption for a kid's image based on: "${imagePrompt}"`,
    });
    return response.text.trim();
  } catch (error) {
    return `A magical visualization of ${imagePrompt}`;
  }
}

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  console.log(`Email to ${to}: ${subject}\n${body}`);
  await new Promise(r => setTimeout(r, 500));
  return true;
}
