import { z } from "zod";

export const onBoardingSchema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre es obligatorio"),
  nickname: z
    .string()
    .optional(),
  birth_date: z
    .date({ error: "La fecha de nacimiento es requerida" })
    .refine((date) => {
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
      return date >= minDate;
    }, "Fecha de nacimiento inválida")
    .refine((date) => {
      const today = new Date();
      const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      return date <= maxDate;
    }, "Debes tener al menos 13 años"),
  gender: z
    .enum(['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'], { error: "Seleccione una opcion de la lista" }),
  interests: z
    .array(z.string())
    .min(3, "Agrega al menos tres intereses")
    .max(10, "Máximo 10 intereses"),
});

export type OnBoardingFormData = z.infer<typeof onBoardingSchema>