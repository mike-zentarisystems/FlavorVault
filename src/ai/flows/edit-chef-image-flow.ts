'use server';
/**
 * @fileOverview A Genkit flow for transforming a portrait into a professional AI Chef.
 *
 * - editChefImage - A function that handles image background removal and chef styling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EditChefImageInputSchema = z.object({
  imageUri: z.string().describe("A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export async function editChefImage(input: { imageUri: string }): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.5-flash-image',
    prompt: [
      { media: { url: input.imageUri } },
      { text: 'Remove the background from this image. Add a professional white chef hat and a classic bushy Italian chef mustache to the person. Make it look like a high-quality, friendly cartoon chef avatar with a transparent background.' },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media) {
    throw new Error('Failed to generate chef avatar');
  }

  return media.url;
}