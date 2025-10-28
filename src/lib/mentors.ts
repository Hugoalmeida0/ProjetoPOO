export function getFeaturedMentors(mentors: any[] = [], topN: number = 3) {
    return (mentors || [])
        .slice()
        .sort((a: any, b: any) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
        .slice(0, topN);
}
