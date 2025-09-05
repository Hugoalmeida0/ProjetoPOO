import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  graduation_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  duration: string;
  mentors_count: number;
  rating: number;
}

export const useSubjects = (graduationId?: string) => {
  return useQuery({
    queryKey: ["subjects", graduationId],
    queryFn: async () => {
      let query = supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (graduationId) {
        query = query.eq("graduation_id", graduationId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Subject[];
    },
  });
};