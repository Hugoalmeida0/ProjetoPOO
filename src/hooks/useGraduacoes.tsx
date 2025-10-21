import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integracoes/api/client";

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
      const data = await apiClient.graduations.getAll();
      return data as Graduation[];
    },
  });
};