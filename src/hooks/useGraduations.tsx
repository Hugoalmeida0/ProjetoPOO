import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Graduation {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  students_count: number;
  subjects_count: number;
  mentors_count: number;
}

export const useGraduations = () => {
  return useQuery({
    queryKey: ["graduations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("graduations")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      return data as Graduation[];
    },
  });
};