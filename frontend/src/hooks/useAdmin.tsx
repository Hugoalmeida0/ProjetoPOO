import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  is_mentor: boolean;
  experience_years: number | null;
  avg_rating: number | null;
  total_ratings: number | null;
  graduation_name: string | null;
}

export interface AdminMentorship {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  objective: string | null;
  created_at: string;
  updated_at: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  cancel_reason: string | null;
  student_full_name: string | null;
  student_user_email: string | null;
  mentor_full_name: string | null;
  mentor_email: string | null;
  subject_name: string | null;
  graduation_name: string | null;
  rating: number | null;
  rating_comment: string | null;
}

export const useAdmin = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [mentorships, setMentorships] = useState<AdminMentorship[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMentorships, setLoadingMentorships] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiClient.admin.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMentorships = async () => {
    setLoadingMentorships(true);
    try {
      const data = await apiClient.admin.getAllMentorships();
      setMentorships(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar mentorias",
        description: error.message || "Não foi possível carregar as mentorias.",
        variant: "destructive",
      });
    } finally {
      setLoadingMentorships(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMentorships();
  }, []);

  return {
    users,
    mentorships,
    loadingUsers,
    loadingMentorships,
    refetchUsers: fetchUsers,
    refetchMentorships: fetchMentorships,
  };
};
