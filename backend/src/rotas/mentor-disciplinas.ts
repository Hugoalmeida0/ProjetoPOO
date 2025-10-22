import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Get subjects for a specific mentor (aceita user_id e/ou mentor_profiles.id)
router.get('/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;

        // Tentar com user_id diretamente
        let result = await pool.query(
            `SELECT s.* 
             FROM subjects s
             JOIN mentor_subjects ms ON s.id = ms.subject_id
             WHERE ms.mentor_id = $1
             ORDER BY s.name`,
            [mentorId]
        );

        // Se nada encontrado, tentar via mentor_profiles.id (quando FK referencia mentor_profiles)
        if (result.rows.length === 0) {
            const mp = await pool.query('SELECT id FROM mentor_profiles WHERE user_id = $1 LIMIT 1', [mentorId]);
            const mentorProfileId = mp.rows?.[0]?.id;
            if (mentorProfileId) {
                result = await pool.query(
                    `SELECT s.* 
                     FROM subjects s
                     JOIN mentor_subjects ms ON s.id = ms.subject_id
                     WHERE ms.mentor_id = $1
                     ORDER BY s.name`,
                    [mentorProfileId]
                );
            }
        }

        res.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching mentor subjects:', error);
        res.status(500).json({ error: error.message });
    }
});

// Set subjects for a mentor (replaces all existing)
router.post('/:mentorId', async (req, res) => {
    const client = await pool.connect();
    try {
        const { mentorId } = req.params;
        const { subject_ids } = req.body;

        if (!Array.isArray(subject_ids)) {
            return res.status(400).json({ error: 'subject_ids must be an array' });
        }

        // Buscar mentor_profiles.id (se existir)
        const mp = await client.query('SELECT id FROM mentor_profiles WHERE user_id = $1 LIMIT 1', [mentorId]);
        const mentorProfileId = mp.rows?.[0]?.id as string | undefined;

        // Descobrir de forma determinística qual tabela a FK referencia (robusto a nomes de constraints)
        const detectReferenced = async (): Promise<string | null> => {
            try {
                const q = await client.query(
                    `SELECT ccu.table_name AS referenced_table
                     FROM information_schema.table_constraints tc
                     JOIN information_schema.key_column_usage kcu
                       ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                     JOIN information_schema.constraint_column_usage ccu
                       ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
                     WHERE tc.table_name = 'mentor_subjects'
                       AND tc.constraint_type = 'FOREIGN KEY'
                       AND kcu.column_name = 'mentor_id'
                     LIMIT 1`
                );
                return q.rows?.[0]?.referenced_table || null;
            } catch {
                return null;
            }
        };

        const referencedTable = await detectReferenced();

        // Monta candidatos de chave, tentando primeiro a tabela detectada
        const candidates: (string | undefined)[] = [];
        const upsert = (v?: string) => { if (v && !candidates.includes(v)) candidates.push(v); };
        if (referencedTable === 'mentor_profiles') {
            upsert(mentorProfileId);
            upsert(mentorId);
        } else if (referencedTable === 'users') {
            upsert(mentorId);
            upsert(mentorProfileId);
        } else {
            // indeterminado: tenta as duas
            upsert(mentorId);
            upsert(mentorProfileId);
        }

        // Função para aplicar setSubjects com uma chave específica (com rollback em erro)
        const applyWithKey = async (key: string) => {
            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM mentor_subjects WHERE mentor_id = $1', [key]);
                if (subject_ids.length > 0) {
                    const values = subject_ids.map((_, idx) => `($1, $${idx + 2})`).join(', ');
                    await client.query(
                        `INSERT INTO mentor_subjects (mentor_id, subject_id) VALUES ${values}`,
                        [key, ...subject_ids]
                    );
                }
                await client.query('COMMIT');
                const resSel = await client.query(
                    `SELECT s.* 
                     FROM subjects s
                     JOIN mentor_subjects ms ON s.id = ms.subject_id
                     WHERE ms.mentor_id = $1
                     ORDER BY s.name`,
                    [key]
                );
                return resSel.rows;
            } catch (e) {
                await client.query('ROLLBACK').catch(() => { });
                throw e;
            }
        };

        // Tenta em ordem os candidatos de chave; se todas falharem, devolve erro consolidado
        let rows: any[] | null = null;
        let lastErr: any = null;
        for (const key of candidates) {
            if (!key) continue;
            try {
                rows = await applyWithKey(key);
                lastErr = null;
                break;
            } catch (e) {
                lastErr = e;
                // tenta próximo candidato
            }
        }
        if (!rows) {
            const msg = (lastErr && (lastErr as any).message) || 'Failed to set mentor subjects';
            throw new Error(`mentor_subjects set failed: ${msg}`);
        }

        res.json(rows || []);
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error setting mentor subjects:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Add a subject to a mentor
router.post('/:mentorId/add', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { subject_id } = req.body;

        await pool.query(
            `INSERT INTO mentor_subjects (mentor_id, subject_id)
             VALUES ($1, $2)
             ON CONFLICT (mentor_id, subject_id) DO NOTHING`,
            [mentorId, subject_id]
        );

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error adding mentor subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove a subject from a mentor
router.delete('/:mentorId/:subjectId', async (req, res) => {
    try {
        const { mentorId, subjectId } = req.params;

        await pool.query(
            'DELETE FROM mentor_subjects WHERE mentor_id = $1 AND subject_id = $2',
            [mentorId, subjectId]
        );

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error removing mentor subject:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
