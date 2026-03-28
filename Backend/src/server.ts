// Backend/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes      from './routes/authRoutes';
import detectionRoutes from './routes/detectionRoutes';
import chatbotRoutes   from './routes/chatbotRoutes';
import reportRoutes    from './routes/reportRoutes';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);       // POST /signup  POST /login  GET /profile
app.use('/api/detect',  detectionRoutes);  // POST /        GET /history  GET /diseases
app.use('/api/chatbot', chatbotRoutes);    // POST /        GET /history  DELETE /history
app.use('/api/report',  reportRoutes);     // GET /:detectionId

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    '✅ CocoAI Backend running!',
    port:      PORT,
    timestamp: new Date(),
    routes: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET  /api/auth/profile',
      'POST /api/detect',
      'GET  /api/detect/history',
      'GET  /api/detect/diseases',
      'POST /api/chatbot',
      'GET  /api/chatbot/history',
      'DELETE /api/chatbot/history',
      'GET  /api/report/:detectionId',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CocoAI Server running on http://localhost:${PORT}`);
  console.log(`📋 API routes: http://localhost:${PORT}/health`);
});

export default app;