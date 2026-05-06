import { z } from 'genkit';

export const RecipeCategorySchema = z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']);
export type RecipeCategory = z.infer<typeof RecipeCategorySchema>;
