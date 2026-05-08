// Backend/src/controllers/detectionController.ts
// ✅ FIXED: Handles DB column mismatches gracefully (severity/fertilizer may not exist)
// ✅ FIXED: Full error logging so you can see exactly what fails
// ✅ FIXED: Passes 422 (non-coconut) straight through to frontend
// ✅ ULTIMATE XAI UPDATE: Passes all 5 XAI features (GradCAM, LIME, BBox, XAI Text, Counterfactuals) to frontend
// ✅ PROPERLY FORMATTED: No truncated lines, fully readable code

import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import pool from '../config/db';
import FormData from 'form-data';

export const detectDisease = async (req: any, res: Response) => {
  const uploadedFilePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // ── Call Flask ML Server ──────────────────────────────────────────────
    const formData = new FormData();
    formData.append('image', fs.createReadStream(uploadedFilePath!));

    let mlResponse: any;
    try {
      mlResponse = await axios.post(
        `${process.env.ML_API_URL || 'http://localhost:8000'}/predict`,
        formData,
        {
          headers:        formData.getHeaders(),
          validateStatus: () => true,   // never throw on HTTP errors — handle manually
          timeout:        60000,        // 60s timeout (model inference can be slow on CPU)
        }
      );
    } catch (networkErr: any) {
      console.error('❌ Flask ML server unreachable:', networkErr.message);
      return res.status(503).json({
        message: 'AI server is not reachable. Make sure Flask is running on port 8000.',
        error:   'ml_server_offline',
      });
    }

    console.log(`📡 Flask response status: ${mlResponse.status}`);
    console.log(`📡 Flask response data:`, JSON.stringify(mlResponse.data, null, 2));

    // ── 422 = not a coconut image — pass straight through ─────────────────
    if (mlResponse.status === 422) {
      try { 
        if (uploadedFilePath) fs.unlinkSync(uploadedFilePath); 
      } catch (e) {
        // silently ignore unlink errors
      }
      return res.status(422).json(mlResponse.data);
    }

    // ── Flask returned an error ───────────────────────────────────────────
    if (mlResponse.status !== 200) {
      console.error(`❌ Flask error ${mlResponse.status}:`, mlResponse.data);
      return res.status(500).json({
        message: `ML server returned error (${mlResponse.status}).`,
        details: mlResponse.data,
      });
    }

    // ── Parse Flask response ──────────────────────────────────────────────
    const flaskData = mlResponse.data;
    const disease           = flaskData.disease          || 'Unknown';
    const confidence        = flaskData.confidence       ?? 0;        // 0.0–1.0
    const severity          = flaskData.severity         || 'Unknown';
    const recommendation    = flaskData.recommendation   || '';
    const fertilizer        = flaskData.fertilizer       || '';
    const all_probabilities = flaskData.all_probabilities || {};

    // 🔥 XAI Features Extracted from Python
    const gradcam_url        = flaskData.gradcam_url        || null;
    const lime_url           = flaskData.lime_url           || null;
    const bbox_url           = flaskData.bbox_url           || null;
    const xai_explanation_en = flaskData.xai_explanation_en || '';
    const xai_explanation_si = flaskData.xai_explanation_si || '';
    const counterfactual_en  = flaskData.counterfactual_en  || '';
    const counterfactual_si  = flaskData.counterfactual_si  || '';
    const feature_importance = flaskData.feature_importance || null;

    // ── Save to DB — try full schema first, fall back to minimal ─────────
    let insertId: number = 0;
    try {
      // Try with all columns (new schema including severity + fertilizer)
      const [result]: any = await pool.query(
        `INSERT INTO detections
           (user_id, image_url, predicted_disease, confidence, severity, gradcam_url, recommendation, fertilizer)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, imageUrl, disease, confidence, severity, gradcam_url, recommendation, fertilizer]
      );
      insertId = result.insertId;
      console.log(`✅ Saved to DB with id: ${insertId}`);
    } catch (dbErr: any) {
      console.warn('⚠️ Full insert failed, trying minimal insert:', dbErr.message);
      try {
        // Fall back — old schema without severity/fertilizer
        const [result]: any = await pool.query(
          `INSERT INTO detections
             (user_id, image_url, predicted_disease, confidence, gradcam_url, recommendation)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.userId, imageUrl, disease, confidence, gradcam_url, recommendation]
        );
        insertId = result.insertId;
        console.log(`✅ Saved to DB (minimal) with id: ${insertId}`);
      } catch (dbErr2: any) {
        // DB insert failed entirely — still return the result to the frontend
        console.error('❌ DB insert failed completely:', dbErr2.message);
      }
    }

    // ── Return complete prediction + ALL XAI Data to frontend ─────────────
    const responseData = {
      id:                 insertId,
      disease:            disease,
      confidence:         parseFloat((confidence * 100).toFixed(2)), // convert to % for frontend
      severity:           severity,
      recommendation:     recommendation,
      fertilizer:         fertilizer,
      imageUrl:           imageUrl,
      createdAt:          new Date().toISOString(),
      all_probabilities:  all_probabilities,
      // Pass all XAI details to Frontend
      gradcam_url:        gradcam_url,
      lime_url:           lime_url,
      bbox_url:           bbox_url,
      xai_explanation_en: xai_explanation_en,
      xai_explanation_si: xai_explanation_si,
      counterfactual_en:  counterfactual_en,
      counterfactual_si:  counterfactual_si,
      feature_importance: feature_importance
    };

    console.log(`✅ Returning result to frontend successfully.`);
    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error('❌ detectDisease unexpected error:', error.message, error.stack);
    return res.status(500).json({
      message: 'Detection failed unexpectedly. Please try again.',
      error:   error.message,
    });
  }
};

// ── GET /detect/history ───────────────────────────────────────────────────────
export const getHistory = async (req: any, res: Response) => {
  try {
    // Try with all columns first
    let rows: any[];
    try {
      const [result]: any = await pool.query(
        `SELECT d.id, d.image_url, d.predicted_disease, d.confidence,
                d.severity, d.gradcam_url, d.recommendation, d.fertilizer,
                d.created_at, u.name as user_name
         FROM detections d
         JOIN users u ON d.user_id = u.id
         WHERE d.user_id = ?
         ORDER BY d.created_at DESC
         LIMIT 50`,
        [req.userId]
      );
      rows = result;
    } catch (err: any) {
      // Fall back for old schema
      console.warn('⚠️ Full history query failed, trying minimal query:', err.message);
      const [result]: any = await pool.query(
        `SELECT d.id, d.image_url, d.predicted_disease, d.confidence,
                d.gradcam_url, d.recommendation, d.created_at, u.name as user_name
         FROM detections d
         JOIN users u ON d.user_id = u.id
         WHERE d.user_id = ?
         ORDER BY d.created_at DESC
         LIMIT 50`,
        [req.userId]
      );
      rows = result;
    }
    return res.json({ history: rows });
  } catch (error: any) {
    console.error('getHistory error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

// ── GET /detect/diseases ──────────────────────────────────────────────────────
export const getDiseaseInfo = async (req: Request, res: Response) => {
  try {
    const [diseases]: any = await pool.query('SELECT * FROM diseases ORDER BY name');
    return res.json({ diseases });
  } catch (error: any) {
    console.error('getDiseaseInfo error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch disease info.' });
  }
};