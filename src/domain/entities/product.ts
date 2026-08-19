import { z } from 'zod';

export const ProductSchema = z.object({
  barcode: z.string().min(1, "Código de barras é obrigatório"),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  brand: z.string().optional().default(""),
  model: z.string().optional().default(""),
  country: z.string().optional().default(""),
  language: z.string().optional().default(""),
  ingredientsText: z.string().min(1, "Ingredientes são obrigatórios"),
  ingredientsOriginal: z.string().optional().default(""),
  nutritionalInfo: z.string().optional().default(""),
  frontImage: z.string().optional(),
  lastProcessed: z.date().optional()
});

export type Product = z.infer<typeof ProductSchema>;
