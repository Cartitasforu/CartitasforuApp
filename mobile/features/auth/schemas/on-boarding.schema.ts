import z from "zod";

const today = new Date();
const minBirthdate = new Date(
  today.getFullYear() - 100,
  today.getMonth(),
  today.getDate()
);
const maxBirthdate = new Date(
  today.getFullYear() - 13,
  today.getMonth(),
  today.getDate()
);

export const onBoardingSchema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre es obligatorio"),
  nickname: z
    .string()
    .optional(),
  birth_date: z
    .date({ error: "La fecha de nacimiento es requerida" })
    .min(minBirthdate, "Fecha de nacimiento inválida")
    .max(maxBirthdate, "Debes tener al menos 13 años"),
  gender: z
    .enum(['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'], {error: "Seleccione una opcion de la lista"}),
  interests: z
    .array(z.string())
    .min(3, "Agrega al menos tres intereses")
    .max(10, "Máximo 10 intereses"),
    
});

export type OnBoardidngFormData = z.infer<typeof onBoardingSchema>