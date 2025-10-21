import { PropsWithChildren, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/integrations/api/client';

export default function RequireMentor({ children }: PropsWithChildren) {
    const { user, loading } = useAuth();
    const [allowed, setAllowed] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            if (loading) return;
            if (!user) { navigate('/auth'); return; }
            // Se já vier is_mentor do /me, usa
            if (typeof user.is_mentor === 'boolean') {
                if (!user.is_mentor) navigate('/');
                setAllowed(!!user.is_mentor);
                return;
            }
            // fallback: buscar profile
            try {
                const profile = await apiClient.profiles.getByUserId(user.id);
                if (!profile?.is_mentor) navigate('/');
                setAllowed(!!profile?.is_mentor);
            } catch {
                navigate('/');
            }
        };
        check();
    }, [user, loading, navigate]);

    if (loading) return null;
    if (!allowed) return null;
    return <>{children}</>;
}
