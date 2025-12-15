import { z } from 'zod';

export const createCodeSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  description: z.string().optional(),
  categoryId: z.string().optional(),
});

export const updateCodeSchema = createCodeSchema.partial();
