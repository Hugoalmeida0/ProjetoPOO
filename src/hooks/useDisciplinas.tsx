import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integracoes/api/client";

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
      const data = await apiClient.subjects.getAll(graduationId);
      return data as Subject[];
    },
  });
};