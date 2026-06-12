// src/features/auth/schemas/sign-up.schema.ts
import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es obligatorio.")
      .email("Ingresa un correo válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula.")
      .regex(/\d/, "Debe incluir al menos un número."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
