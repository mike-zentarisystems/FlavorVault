'use server';
/**
 * @fileOverview A Genkit flow for generating recipe suggestions based on a list of ingredients.
 *
 * - generateRecipeFromPantry - A function that handles the recipe generation process.
 * - GenerateRecipeFromPantryInput - The input type for the generateRecipeFromPantry function.
 * - GenerateRecipeFromPantryOutput - The return type for the generateRecipeFromPantry function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeCategorySchema } from './shared-schemas';

const GenerateRecipeFromPantryInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients currently available in the pantry.'),
});
export type GenerateRecipeFromPantryInput = z.infer<
  typeof GenerateRecipeFromPantryInputSchema
>;

const GenerateRecipeFromPantryOutputSchema = z.object({
  title: z.string().describe('The title of the generated recipe.'),
  prepTime: z.string().describe('The estimated preparation time for the recipe.'),
  category: RecipeCategorySchema.describe('The category of the meal (Breakfast, Lunch, Dinner, Snack, or Dessert).'),
  ingredientsNeeded: z
    .array(z.string())
    .describe('A list of all ingredients required for the recipe, including quantities.'),
  instructions: z
    .array(z.string())
    .describe('An ordered list of steps to prepare the recipe.'),
  sourceUrl: z.string().optional().describe('The original source URL if applicable.'),
});
export type GenerateRecipeFromPantryOutput = z.infer<
  typeof GenerateRecipeFromPantryOutputSchema
>;

export async function generateRecipeFromPantry(
  input: GenerateRecipeFromPantryInput
): Promise<GenerateRecipeFromPantryOutput> {
  return generateRecipeFromPantryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeFromPantryPrompt',
  input: { schema: GenerateRecipeFromPantryInputSchema },
  output: { schema: GenerateRecipeFromPantryOutputSchema },
  prompt: `Act as an expert chef. I only have the following ingredients: {{{ingredients}}}. 

Create a delicious recipe using only these items. You can assume I have basics like salt, pepper, water, and cooking oil. 

Pick the category that best fits the vibe of the dish (MUST be one of: Breakfast, Lunch, Dinner, Snack, or Dessert). Provide a creative title, estimated prep time, the full list of ingredients with quantities, and clear step-by-step instructions.`,
});

const generateRecipeFromPantryFlow = ai.defineFlow(
  {
    name: 'generateRecipeFromPantryFlow',
    inputSchema: GenerateRecipeFromPantryInputSchema,
    outputSchema: GenerateRecipeFromPantryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate recipe.');
    }
    return output;
  }
);
