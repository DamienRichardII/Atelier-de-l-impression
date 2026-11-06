import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().max(40),
    color: z.string().max(40),
    sizes: z.record(z.string().max(10), z.number().int().min(0).max(1000)),
    assetsId: z.string().uuid().nullable(),
  })).min(1).max(20),
  customer: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().min(6).max(30),
  }),
  consent: z.literal(true),               // CGV + confidentialité
  website: z.string().max(0).optional().default(""), // honeypot
  idempotencyKey: z.string().uuid(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
