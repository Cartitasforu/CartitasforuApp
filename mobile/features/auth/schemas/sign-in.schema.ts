import z from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatoriio")
    .email("Ingresa un correo valido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    
});

export type SignInFormData = z.infer<typeof signInSchema>