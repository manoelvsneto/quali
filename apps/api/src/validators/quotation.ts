import { z } from 'zod';

export const createQuotationSchema = z.object({
  documentId: z.string(),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  exactText: z.string().min(1),
  codeIds: z.array(z.string()).min(1),
});

export const updateQuotationSchema = z.object({
  codeIds: z.array(z.string()).min(1),
});
