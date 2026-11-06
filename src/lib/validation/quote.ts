import { z } from "zod";

export const quoteSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(30),
  company: z.string().trim().max(120).optional().default(""),
  customerType: z.enum(["particulier", "professionnel"]),
  delivery: z.enum(["retrait", "livraison"]),
  address: z.string().trim().max(300).optional().default(""),
  desiredDate: z.string().max(10).optional().default(""),
  comments: z.string().trim().max(2000).optional().default(""),
  consent: z.literal("on"),
  website: z.string().max(0).optional().default(""), // honeypot
}).refine((d) => d.delivery !== "livraison" || d.address.length > 5, { message: "Adresse requise pour la livraison", path: ["address"] });

export const configSchema = z.object({
  productId: z.string().max(40),
  color: z.string().max(40),
  quantity: z.number().int().min(1).max(100000),
  sizes: z.record(z.string(), z.number().int().min(0).max(100000)),
  faces: z.record(z.string(), z.object({
    fileName: z.string().max(200), cx: z.number(), cy: z.number(), scale: z.number(), rotation: z.number(),
  })),
});
