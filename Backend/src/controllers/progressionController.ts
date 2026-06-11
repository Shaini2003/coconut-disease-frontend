// Backend/src/controllers/progressionController.ts
import { Request, Response } from 'express';
import pool from '../config/db';

export const calculateProgression = async (req: Request, res: Response) => {
    try {
        // req.body එක සඳහා අවශ්‍ය දත්ත
        const { userId, diseaseName, oldScore, newScore } = req.body;
        
        // ගණනය කිරීමේ තර්කය
        const improvement: number = ((oldScore - newScore) / oldScore) * 100;
        const status: string = improvement > 0 ? 'Recovering' : 'Worsening';

        // MySQL එකට දත්ත ඇතුළු කිරීම
        const query: string = `INSERT INTO progression_history (user_id, disease_name, old_score, new_score, improvement_percent, status) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [userId, diseaseName, oldScore, newScore, improvement.toFixed(2), status]);

        res.status(200).json({ 
            success: true, 
            improvement: improvement.toFixed(2), 
            status 
        });
    } catch (error) {
        console.error('Progression error:', error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};