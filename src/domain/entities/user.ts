import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  privacyTermsAccepted: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos de privacidade para continuar.",
  }),
  phone: z.string().optional(),
  alternativeEmail: z.string().optional(),
  fullName: z.string().optional(),
  nationality: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AppUser = z.infer<typeof UserSchema>;

export const HealthProfileSchema = z.object({
  id: z.string(),
  parentUid: z.string(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  type: z.enum(['self', 'child', 'other']),
  conditions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

export type HealthProfile = z.infer<typeof HealthProfileSchema>;

export const ScanRecordSchema = z.object({
  id: z.string().optional(),
  productName: z.string(),
  status: z.enum(['green', 'yellow', 'red']),
  reason: z.string(),
  timestamp: z.date(),
  ingredients: z.string().optional(),
  userRating: z.number().min(1).max(5).optional(),
  userComment: z.string().optional(),
});

export type ScanRecord = z.infer<typeof ScanRecordSchema>;
