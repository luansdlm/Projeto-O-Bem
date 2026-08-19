import { z } from 'zod';

export const PendingProductSchema = z.object({
  id: z.string().optional(),
  barcode: z.string().min(1, "Código de barras é obrigatório"),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  brand: z.string().optional().default(""),
  model: z.string().optional().default(""),
  category: z.enum(['alimento', 'medicamento', 'beleza', 'outro']).default('alimento'),
  country: z.string().optional().default("Brasil"),
  language: z.string().optional().default("Português"),
  ingredientsText: z.string().min(1, "Ingredientes extraídos são obrigatórios"),
  ingredientsOriginal: z.string().optional().default(""),
  nutritionalInfo: z.string().optional().default(""),
  frontImageBase64: z.string().optional(), // Foto da frente da embalagem (armazenamento otimizado)
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  submittedBy: z.string().min(1),
  submittedByEmail: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type PendingProduct = z.infer<typeof PendingProductSchema>;
