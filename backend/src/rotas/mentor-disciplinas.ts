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

        console.log('[DEBUG] mentorId (from params):', mentorId);
        console.log('[DEBUG] mentorProfileId (from DB):', mentorProfileId);

        // DIAGNÓSTICO: vamos descobrir exatamente qual tabela a FK referencia
        try {
            const fkInfo = await client.query(`
                SELECT
                    tc.constraint_name,
                    tc.table_name AS source_table,
                    kcu.column_name AS source_column,
                    ccu.table_name AS referenced_table,
                    ccu.column_name AS referenced_column
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_name = 'mentor_subjects'
                    AND kcu.column_name = 'mentor_id'
            `);
            console.log('[DEBUG] FK SCHEMA INFO:', JSON.stringify(fkInfo.rows, null, 2));

            // Verificar se os IDs existem nas tabelas candidatas
            const checkUsers = await client.query('SELECT id FROM users WHERE id = $1', [mentorId]);
            const checkMentorProfiles = mentorProfileId 
                ? await client.query('SELECT id FROM mentor_profiles WHERE id = $1', [mentorProfileId])
                : { rows: [] };
            
            console.log('[DEBUG] ID exists in users?', checkUsers.rows.length > 0, '- ID:', mentorId);
            console.log('[DEBUG] ID exists in mentor_profiles?', checkMentorProfiles.rows.length > 0, '- ID:', mentorProfileId);
        } catch (err) {
            console.error('[DEBUG] Failed to query FK info:', err);
        }

        // Estratégia: tentar SEMPRE ambas as chaves em ordem de probabilidade
        // 1. mentor_profiles.id (mais comum em schemas novos)
        // 2. users.id (fallback para schemas antigos)
        const candidates: string[] = [];
        if (mentorProfileId) candidates.push(mentorProfileId);
        if (mentorId) candidates.push(mentorId);
        
        console.log('[DEBUG] Will try keys in order:', candidates);

        if (candidates.length === 0) {
            throw new Error('No valid mentor ID found (neither user_id nor mentor_profile.id)');
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
        let successKey: string | null = null;
        
        for (const key of candidates) {
            console.log('[DEBUG] Attempting with key:', key);
            try {
                rows = await applyWithKey(key);
                successKey = key;
                console.log('[DEBUG] ✅ SUCCESS with key:', key);
                break;
            } catch (e: any) {
                console.error('[DEBUG] ❌ FAILED with key:', key);
                console.error('[DEBUG] Error detail:', e.message);
                console.error('[DEBUG] Error code:', e.code);
                lastErr = e;
                // tenta próximo candidato
            }
        }
        
        if (!rows) {
            const msg = (lastErr && lastErr.message) || 'Failed to set mentor subjects';
            console.error('[DEBUG] 🚨 ALL ATTEMPTS FAILED');
            console.error('[DEBUG] Last error:', msg);
            console.error('[DEBUG] Tried keys:', candidates);
            throw new Error(`mentor_subjects set failed: ${msg}`);
        }
        
        console.log('[DEBUG] Final success - used key:', successKey);

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
