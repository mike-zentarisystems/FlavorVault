
'use server';
/**
 * @fileOverview A Genkit flow for importing recipes from various sources (text, images, URLs, YouTube).
 *
 * - importRecipe - A function that handles the parsing of raw data into a structured recipe.
 * - ImportRecipeInput - The input type for the importRecipe function.
 * - ImportRecipeOutput - The return type for the importRecipe function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeCategorySchema } from './shared-schemas';

const ImportRecipeInputSchema = z.object({
  type: z.enum(['text', 'image', 'url', 'document']),
  content: z.string().describe('The raw text, URL, or base64 data URI of the recipe source.'),
});
export type ImportRecipeInput = z.infer<typeof ImportRecipeInputSchema>;

const ImportRecipeOutputSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  chefName: z.string().optional().describe('The name of the chef who created the recipe, if identifiable.'),
  prepTime: z.string().describe('The estimated preparation time.'),
  category: RecipeCategorySchema.describe('The category of the meal (Breakfast, Lunch, Dinner, Snack, or Dessert).'),
  ingredientsNeeded: z.array(z.string()).describe('List of ingredients with quantities.'),
  instructions: z.array(z.string()).min(1).describe('Ordered steps for the recipe.'),
  sourceUrl: z.string().optional().describe('The original source URL (e.g. YouTube, blog post) if provided.'),
});
export type ImportRecipeOutput = z.infer<typeof ImportRecipeOutputSchema>;

/**
 * Basic helper to fetch and clean HTML content from a URL.
 */
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch (${response.status} ${response.statusText})`);
    }
    
    const html = await response.text();
    const cleanedText = html
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gmi, "")
      .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gmi, "")
      .replace(/<footer\b[^<]*>([\s\S]*?)<\/footer>/gmi, "")
      .replace(/<nav\b[^<]*>([\s\S]*?)<\/nav>/gmi, "")
      .replace(/<header\b[^<]*>([\s\S]*?)<\/header>/gmi, "")
      .replace(/<[^>]+>/gm, " ")
      .replace(/\s+/gm, " ")
      .trim()
      .substring(0, 15000);

    if (cleanedText.length < 50) {
      throw new Error('The extracted content is too short to parse.');
    }

    return cleanedText;
  } catch (error) {
    throw new Error(`Error fetching URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function importRecipe(input: ImportRecipeInput): Promise<ImportRecipeOutput> {
  return importRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importRecipePrompt',
  input: { schema: z.object({ type: z.string(), content: z.string(), originalUrl: z.string().optional(), isMedia: z.boolean() }) },
  output: { schema: ImportRecipeOutputSchema },
  prompt: `You are an expert culinary assistant. Your goal is to extract recipe information from a provided source.
  
  Source Type: {{{type}}}
  
  Content to process:
  {{#if isMedia}}
  {{media url=content}}
  {{else}}
  {{{content}}}
  {{/if}}
  
  {{#if originalUrl}}
  Original URL: {{{originalUrl}}}
  {{/if}}
  
  Instructions:
  1. Extract and format the recipe into a title, prep time, a category (MUST be one of: Breakfast, Lunch, Dinner, Snack, or Dessert), ingredient list, and clear steps for instructions.
  2. If the source content looks like a YouTube description or transcript, use it to identify the recipe.
  3. ALWAYS include the original URL if provided.
  4. If the source is an image or document, use OCR to understand the recipe.
  5. Be smart about categorization.
  6. Extract the chef's name if it's identifiable in the source.`,
});

const importRecipeFlow = ai.defineFlow(
  {
    name: 'importRecipeFlow',
    inputSchema: ImportRecipeInputSchema,
    outputSchema: ImportRecipeOutputSchema,
  },
  async (input) => {
    let contentToProcess = input.content;
    let originalUrl = undefined;
    const isMedia = input.type === 'image' || input.type === 'document';

    if (input.type === 'url') {
      originalUrl = input.content;
      contentToProcess = await fetchUrlContent(input.content);
    }

    const { output } = await prompt({ 
      type: input.type, 
      content: contentToProcess,
      originalUrl,
      isMedia
    });

    if (!output) {
      throw new Error('Failed to parse recipe from the provided source.');
    }
    
    if (originalUrl && !output.sourceUrl) {
      output.sourceUrl = originalUrl;
    }

    return output;
  }
);
