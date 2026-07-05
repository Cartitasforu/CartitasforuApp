import { supabase } from "@/lib/supabase";

export async function getMySpace(user_id: string | null) {
  const { data, error } = await supabase
    .from("space_member")
    .select(
      `
      role,
      space:space_id (
        id,
        name,
        known_date,
        official_date
      )
    `,
    )
    .eq("user_id", user_id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const rawSpace = data?.space;
  const space = Array.isArray(rawSpace) ? rawSpace[0] : rawSpace;

  if (!space) return null;


  return {
    role: data.role as "owner" | "member",
    space: {
      id: space.id,
      name: space.name,
      known_date: space.known_date ?? null,
      official_date: space.official_date ?? null,
    },
  };
}
