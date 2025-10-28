import { describe, it, expect } from 'vitest';
import { getFeaturedMentors } from '@/lib/mentors';

describe('getFeaturedMentors', () => {
    it('returns top N mentors ordered by avg_rating desc', () => {
        const mentors = [
            { id: 1, avg_rating: 4.2 },
            { id: 2, avg_rating: 4.8 },
            { id: 3, avg_rating: 3.9 },
            { id: 4, avg_rating: 5.0 },
        ];

        const top2 = getFeaturedMentors(mentors, 2);
        expect(top2).toHaveLength(2);
        expect(top2[0].id).toBe(4); // 5.0
        expect(top2[1].id).toBe(2); // 4.8
    });

    it('handles empty or undefined input gracefully', () => {
        expect(getFeaturedMentors(undefined as any, 3)).toEqual([]);
        expect(getFeaturedMentors([], 3)).toEqual([]);
    });
});
