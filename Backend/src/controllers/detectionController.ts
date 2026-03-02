import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import pool from '../config/db';
import FormData from 'form-data';

export const detectDisease = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Call Python ML Flask API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const mlResponse = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      formData,
      { headers: formData.getHeaders() }
    );

    const { disease, confidence, gradcam_url, recommendation } = mlResponse.data;

    // Save result to MySQL
    const [result]: any = await pool.query(
      `INSERT INTO detections 
       (user_id, image_url, predicted_disease, confidence, gradcam_url, recommendation) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, imageUrl, disease, confidence, gradcam_url || null, recommendation]
    );

    res.json({
      id: result.insertId,
      disease,
      confidence: parseFloat((confidence * 100).toFixed(2)),
      gradcam_url,
      recommendation,
      imageUrl,
      createdAt: new Date()
    });
  } catch (error: any) {
    console.error('Detection error:', error.message);
    res.status(500).json({ message: 'Detection failed. Make sure ML server is running.' });
  }
};

export const getHistory = async (req: any, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT d.*, u.name as user_name 
       FROM detections d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.user_id = ? 
       ORDER BY d.created_at DESC`,
      [req.userId]
    );
    res.json({ history: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

export const getDiseaseInfo = async (req: Request, res: Response) => {
  try {
    const [diseases]: any = await pool.query('SELECT * FROM diseases');
    res.json({ diseases });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch disease info.' });
  }
};