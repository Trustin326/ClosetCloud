import { z } from "zod";

export const closetItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.enum(["tops", "bottoms", "dresses", "shoes", "bags", "accessories", "outerwear", "other"]),
  imageUrl: z.string().url().max(2048).optional().or(z.literal("")),
  color: z.string().max(40).optional(),
  brand: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
  isPublic: z.boolean().default(false)
});

export const outfitSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().max(500).optional(),
  itemIds: z.array(z.string().uuid()).max(30).default([]),
  occasion: z.string().max(60).optional(),
  isPublic: z.boolean().default(false)
});
