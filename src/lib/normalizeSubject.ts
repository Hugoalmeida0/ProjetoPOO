/**
 * Normaliza o texto de especialidade/matéria para evitar duplicatas
 * Remove acentos, converte para minúsculas e capitaliza apenas a primeira letra
 */
export function normalizeSubject(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove espaços extras e trim
  const trimmed = text.trim().replace(/\s+/g, ' ');
  
  // Converte para minúsculas
  const lowercase = trimmed.toLowerCase();
  
  // Remove acentos
  const normalized = lowercase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Capitaliza primeira letra de cada palavra
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Compara duas especialidades ignorando acentuação e case
 */
export function areSubjectsEqual(a: string, b: string): boolean {
  return normalizeSubject(a) === normalizeSubject(b);
}

/**
 * Remove duplicatas de um array de especialidades
 */
export function uniqueSubjects(subjects: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const subject of subjects) {
    const normalized = normalizeSubject(subject);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  
  return result.sort((a, b) => a.localeCompare(b));
}
