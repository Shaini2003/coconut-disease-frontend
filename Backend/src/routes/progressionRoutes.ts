import express from 'express';
import { calculateProgression } from '../controllers/progressionController';
import pool from '../config/db'; 

const router = express.Router();

router.post('/calculate', calculateProgression);


router.get('/history/:userId', async (req, res) => {
    try {
        const [rows] = await (pool as any).query('SELECT * FROM progression_history WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Database error" }); }
});

export default router;