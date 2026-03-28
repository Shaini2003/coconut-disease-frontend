// Backend/src/controllers/detectionController.ts

import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import pool from '../config/db';

// ── Disease metadata ──────────────────────────────────────────────────────────
const DISEASE_META: Record<string, { severity: string; fertilizer: string; recommendation: string }> = {
  'Bud Root Dropping': {
    severity:       'High',
    recommendation: 'Inspect root zone immediately. Improve soil drainage and avoid waterlogging. Apply systemic fungicide (Metalaxyl) to the root zone. Remove severely affected roots.',
    fertilizer:     'Apply potassium-rich fertilizer MOP (0-0-60) at 500g per tree. Avoid excess nitrogen which promotes disease spread.',
  },
  'Bud Rot': {
    severity:       'Critical',
    recommendation: 'Remove and destroy all infected bud tissue immediately. Apply copper oxychloride fungicide (3g/L) to crown area. Repeat every 2 weeks. Notify nearby farmers.',
    fertilizer:     'Apply balanced NPK 12-12-17 with magnesium sulphate. Avoid over-irrigation. Add organic compost to improve soil health.',
  },
  'CCI_Caterpillars': {
    severity:       'Medium',
    recommendation: 'Apply Bacillus thuringiensis (Bt) biological spray. Remove caterpillar nests manually. Introduce natural predators like parasitic wasps.',
    fertilizer:     'Apply nitrogen fertilizer Urea (46%) at 200g per tree to boost leaf regrowth after damage.',
  },
  'Gray Leaf Spot': {
    severity:       'Medium',
    recommendation: 'Spray Mancozeb fungicide (2g/L) or Carbendazim (1g/L) every 2 weeks. Remove heavily infected leaves. Improve air circulation.',
    fertilizer:     'Apply potassium sulphate (0-0-50) to strengthen cell walls. Supplement with zinc micronutrients.',
  },
  'Healthy_Leaves': {
    severity:       'None',
    recommendation: 'Your coconut tree is healthy! Continue regular monitoring. Water consistently and maintain soil pH between 5.5 and 7.0.',
    fertilizer:     'Apply balanced NPK 14-14-14 at 500g per tree every 3 months for optimal growth.',
  },
  'Leaf Rot': {
    severity:       'High',
    recommendation: 'Remove all rotting fronds immediately. Apply Bordeaux mixture to cut surfaces. Ensure proper drainage around the base.',
    fertilizer:     'Apply calcium nitrate (15.5-0-0) to strengthen leaf tissue. Add single super phosphate for root development.',
  },
  'Stem Bleeding': {
    severity:       'Critical',
    recommendation: 'Chisel out all infected dark tissue until healthy tissue is visible. Apply Bordeaux paste or hot coal tar to the wound. Avoid further physical damage to the trunk.',
    fertilizer:     'Apply balanced fertilizer with boron and copper micronutrients. Use organic compost to improve soil health and drainage.',
  },
  'WCLWD_DryingofLeaflets': {
    severity:       'Critical',
    recommendation: 'URGENT: Report to the Coconut Research Institute of Sri Lanka (CRISL) immediately. Remove and destroy severely infected palms. Control planthopper vectors using Imidacloprid.',
    fertilizer:     'Apply organic manure and balanced NPK. Intercropping with legumes can improve soil health and slow disease progression.',
  },
};

// ── POST /api/detect ──────────────────────────────────────────────────────────
export const detectDisease = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const imagePath = req.file.path;
    const imageUrl  = `/uploads/${req.file.filename}`;

    // Forward image to Flask ML server
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    let mlData: any;
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_API_URL || 'http://localhost:8000'}/predict`,
        formData,
        { headers: formData.getHeaders(), timeout: 30000 }
      );
      mlData = mlResponse.data;
    } catch (mlError: any) {
      // Clean up uploaded file on ML error
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(503).json({
        message: '❌ ML server is not running. Please start the Flask server on port 8000.',
      });
    }

    const disease    = mlData.disease;
    // Flask returns 0.0–1.0 → convert ONCE to percentage
    const confidence = parseFloat((mlData.confidence * 100).toFixed(2));
    const gradcamUrl = mlData.gradcam_url   || null;
    const allProbs   = mlData.all_probabilities || {};

    // ── Reject non-coconut-leaf images (confidence below 70%) ────────────────
    if (confidence < 70.0) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(422).json({
        message: '⚠️ The uploaded image does not appear to be a coconut leaf. Please upload a clear photo of a coconut leaf.',
        confidence,
        is_valid_leaf: false,
      });
    }

    // Get metadata (recommendation, fertilizer, severity)
    const meta = DISEASE_META[disease] || {
      severity:       'Unknown',
      recommendation: mlData.recommendation || 'Consult an agricultural expert.',
      fertilizer:     'Apply balanced NPK fertilizer.',
    };

    // Save to MySQL detections table
    const [result]: any = await pool.query(
      `INSERT INTO detections
         (user_id, image_url, predicted_disease, confidence, gradcam_url, recommendation)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, imageUrl, disease, confidence, gradcamUrl, meta.recommendation]
    );

    return res.json({
      id:               result.insertId,
      disease,
      confidence,                  // already percentage e.g. 92.4
      gradcam_url:      gradcamUrl,
      recommendation:   meta.recommendation,
      fertilizer:       meta.fertilizer,
      severity:         meta.severity,
      all_probabilities: allProbs, // { 'Bud Rot': 92.4, 'Healthy_Leaves': 3.1, … }
      imageUrl,
      createdAt:        new Date(),
    });

  } catch (error: any) {
    console.error('Detection error:', error.message);
    return res.status(500).json({ message: 'Detection failed: ' + error.message });
  }
};

// ── GET /api/detect/history ───────────────────────────────────────────────────
export const getHistory = async (req: any, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT d.id, d.image_url, d.predicted_disease, d.confidence,
              d.gradcam_url, d.recommendation, d.created_at,
              u.name AS user_name
       FROM   detections d
       JOIN   users u ON d.user_id = u.id
       WHERE  d.user_id = ?
       ORDER  BY d.created_at DESC
       LIMIT  50`,
      [req.userId]
    );
    return res.json({ history: rows });
  } catch (error: any) {
    console.error('History error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

// ── GET /api/detect/diseases ──────────────────────────────────────────────────
export const getDiseaseInfo = async (req: Request, res: Response) => {
  try {
    const [diseases]: any = await pool.query('SELECT * FROM diseases ORDER BY name ASC');
    return res.json({ diseases });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch disease info.' });
  }
};