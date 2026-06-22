import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("Correo inválido"),
});

export type ForgotPasswordSchema =
  z.infer<typeof forgotPasswordSchema>;