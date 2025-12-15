import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});
