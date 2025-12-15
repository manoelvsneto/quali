import { z } from 'zod';

export const createMemoSchema = z.object({
  content: z.string().min(1),
  documentId: z.string().optional(),
  quotationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateMemoSchema = createMemoSchema.partial();
