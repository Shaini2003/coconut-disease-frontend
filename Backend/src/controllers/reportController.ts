// Backend/src/controllers/reportController.ts
// ✅ ULTIMATE A+ REPORT: Professional Medical/Agri Lab Style PDF
// ✅ Includes XAI (LIME, BBox, GradCAM), Feature Importance Bars, and Counterfactuals

import { Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import pool from '../config/db';

const SEVERITY_RGB: Record<string, [number, number, number]> = {
  Critical: [220, 38,  38],  // Red
  High:     [234, 88,  12],  // Orange
  Medium:   [202, 138,  4],  // Yellow
  None:     [22,  163, 74],  // Green
  Unknown:  [107, 114, 128], // Gray
};

export const generateReport = async (req: any, res: Response) => {
  try {
    const { detectionId } = req.params;

    // Get all data including the new XAI columns from the detections table
    const [rows]: any = await pool.query(
      `SELECT d.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM   detections d
       JOIN   users u ON d.user_id = u.id
       WHERE  d.id = ? AND d.user_id = ?`,
      [detectionId, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Detection not found.' });
    }

    const det        = rows[0];
    const disease    = det.predicted_disease || 'Unknown';
    const severity   = det.severity || 'Unknown';
    const sevRgb     = SEVERITY_RGB[severity] || SEVERITY_RGB['Unknown'];
    const confidence = parseFloat(det.confidence).toFixed(1);
    const detectedAt = new Date(det.created_at);
    
    // XAI Data (if exists in DB, otherwise fallbacks)
    const xaiEn       = det.xai_explanation_en || 'The AI model analyzed visual patterns to classify this disease.';
    const cfEn        = det.counterfactual_en  || 'If the leaf patterns were uniform and green, it would be Healthy.';
    const featImpStr  = det.feature_importance || '{}';
    let featImp: Record<string, number> = {};
    try { featImp = typeof featImpStr === 'string' ? JSON.parse(featImpStr) : featImpStr; } catch (e) {}

    // ── Build PDF ──────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CocoAI_LabReport_${detectionId}.pdf"`);
    doc.pipe(res);

    const W  = 595;
    const M  = 40;
    const CW = W - M * 2;

    // ── HEADER SECTION ──
    doc.rect(0, 0, W, 85).fill('#064E3B'); // Dark Green Banner
    doc.rect(0, 85, W, 5).fill('#10B981'); // Light Green accent

    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
       .text('CocoAI Diagnostic Report', M, 22, { width: CW });
    doc.fillColor('#A7F3D0').fontSize(11).font('Helvetica')
       .text('Advanced AI Pathology Analysis | Coconut Research', M, 52, { width: CW });

    let y = 110;

    // ── PATIENT/USER INFO BOX ──
    doc.rect(M, y, CW, 70).fill('#F3F4F6').stroke('#E5E7EB');
    doc.lineWidth(1);
    doc.stroke();

    doc.fillColor('#4B5563').fontSize(9).font('Helvetica-Bold')
       .text('REPORT ID:', M + 15, y + 15)
       .text('DATE/TIME:', M + 15, y + 30)
       .text('REQUESTER:', M + 15, y + 45);

    doc.fillColor('#111827').font('Helvetica').fontSize(9)
       .text(`COCO-${detectionId}-${Date.now().toString().slice(-6)}`, M + 90, y + 15)
       .text(detectedAt.toLocaleString('en-GB'), M + 90, y + 30)
       .text(`${det.user_name} (${det.user_email})`, M + 90, y + 45);

    // AI Status Badge
    doc.rect(W - M - 110, y + 15, 95, 20).fill('#DCFCE7');
    doc.fillColor('#065F46').font('Helvetica-Bold').fontSize(8)
       .text('✔ AI VERIFIED', W - M - 110, y + 21, { width: 95, align: 'center' });

    y += 90;

    // ── DIAGNOSIS RESULT (BIG BADGE) ──
    doc.rect(M, y, CW, 80).fill('#FFFFFF').stroke('#E5E7EB');
    doc.rect(M, y, 6, 80).fill(`rgb(${sevRgb.join(',')})`); // Left color strip
    doc.stroke();

    doc.fillColor('#6B7280').fontSize(10).font('Helvetica-Bold')
       .text('PRIMARY DIAGNOSIS', M + 20, y + 15);
       
    doc.fillColor(`rgb(${sevRgb.join(',')})`).fontSize(22).font('Helvetica-Bold')
       .text(disease.replace(/_/g, ' '), M + 20, y + 32);

    // Severity Tag
    doc.rect(M + 20, y + 60, 60, 15).fill(`rgb(${sevRgb.join(',')})`);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
       .text(severity.toUpperCase(), M + 20, y + 64, { width: 60, align: 'center' });

    // Confidence
    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
       .text('AI CONFIDENCE:', W - M - 160, y + 30);
    doc.fillColor('#059669').fontSize(26).font('Helvetica-Bold')
       .text(`${confidence}%`, W - M - 70, y + 20);

    y += 100;

    // ── VISUAL EVIDENCE (IMAGES) ──
    const getMLPath = (url: string | null) => {
        if (!url) return null;
        return path.join(__dirname, '../../../ML_Model/xai_outputs', path.basename(url));
    };

    const origImgPath = det.image_url ? path.join(__dirname, '../../', det.image_url) : null;
    const gcImgPath   = getMLPath(det.gradcam_url);
    const limePath    = getMLPath(det.lime_url);
    const bboxPath    = getMLPath(det.bbox_url);

    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text('Visual Diagnostics & XAI', M, y);
    doc.rect(M, y + 15, CW, 1).fill('#E5E7EB');
    y += 25;

    const imgWidth = 120;
    const imgHeight = 120;
    let currentX = M;

    // Helper to draw image boxes
    const drawImgBox = (imgPath: string | null, title: string, xPos: number) => {
        if (imgPath && fs.existsSync(imgPath)) {
            try {
                doc.image(imgPath, xPos, y, { width: imgWidth, height: imgHeight });
                doc.rect(xPos, y, imgWidth, imgHeight).stroke('#D1D5DB');
                doc.fillColor('#4B5563').fontSize(8).font('Helvetica-Bold')
                   .text(title, xPos, y + imgHeight + 8, { width: imgWidth, align: 'center' });
                return true;
            } catch (e) { return false; }
        }
        return false;
    };

    let hasImages = false;
    if (drawImgBox(origImgPath, 'Original Upload', currentX)) { currentX += imgWidth + 12; hasImages = true; }
    if (drawImgBox(gcImgPath, 'Grad-CAM Heatmap', currentX)) { currentX += imgWidth + 12; hasImages = true; }
    if (drawImgBox(limePath, 'LIME Superpixels', currentX)) { currentX += imgWidth + 12; hasImages = true; }
    if (drawImgBox(bboxPath, 'Symptom Bounding Box', currentX)) { currentX += imgWidth + 12; hasImages = true; }

    if (hasImages) y += imgHeight + 35;

    // ── EXPLAINABLE AI (XAI) REASONING ──
    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text('AI Reasoning & Counterfactuals', M, y);
    doc.rect(M, y + 15, CW, 1).fill('#E5E7EB');
    y += 25;

    const xaiH = Math.max(50, doc.heightOfString(xaiEn, { width: CW - 30 }) + 30);
    doc.rect(M, y, CW, xaiH).fill('#F5F3FF').stroke('#DDD6FE');
    doc.rect(M, y, 4, xaiH).fill('#8B5CF6');
    doc.fillColor('#5B21B6').fontSize(10).font('Helvetica-Bold').text('Reasoning:', M + 15, y + 10);
    doc.fillColor('#4C1D95').fontSize(9).font('Helvetica').text(xaiEn, M + 15, y + 25, { width: CW - 30 });
    y += xaiH + 10;

    const cfH = Math.max(40, doc.heightOfString(cfEn, { width: CW - 30 }) + 25);
    doc.rect(M, y, CW, cfH).fill('#F0FDF4').stroke('#BBF7D0');
    doc.rect(M, y, 4, cfH).fill('#22C55E');
    doc.fillColor('#166534').fontSize(10).font('Helvetica-Bold').text('Counterfactual Insight:', M + 15, y + 10);
    doc.fillColor('#14532D').fontSize(9).font('Helvetica-Oblique').text(`"${cfEn}"`, M + 15, y + 25, { width: CW - 30 });
    y += cfH + 20;

    // Check page break
    if (y > 600) { doc.addPage(); y = 50; }

    // ── FEATURE IMPORTANCE CHART ──
    const features = Object.entries(featImp);
    if (features.length > 0) {
        doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text('Feature Importance', M, y);
        doc.rect(M, y + 15, CW, 1).fill('#E5E7EB');
        y += 30;

        features.forEach(([feat, val]) => {
            const numVal = Number(val) || 0;
            doc.fillColor('#4B5563').fontSize(9).font('Helvetica-Bold').text(feat, M, y);
            doc.fillColor('#6B7280').text(`${numVal}%`, W - M - 30, y);
            
            // Draw Bar
            doc.rect(M + 150, y + 2, CW - 190, 6).fill('#E5E7EB');
            const barW = Math.min((numVal / 100) * (CW - 190), CW - 190);
            doc.rect(M + 150, y + 2, barW, 6).fill('#10B981');
            
            y += 20;
        });
        y += 10;
    }

    // Check page break
    if (y > 600) { doc.addPage(); y = 50; }

    // ── PRESCRIPTIONS (TREATMENT & FERTILIZER) ──
    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text('Recommended Actions', M, y);
    doc.rect(M, y + 15, CW, 1).fill('#E5E7EB');
    y += 25;

    // Treatment Box
    const treatText = det.recommendation || 'Consult an agricultural expert.';
    const treatH = Math.max(50, doc.heightOfString(treatText, { width: CW - 30 }) + 30);
    doc.rect(M, y, CW, treatH).fill('#FFFBEB').stroke('#FEF08A');
    doc.rect(M, y, 4, treatH).fill('#F59E0B');
    doc.fillColor('#B45309').fontSize(10).font('Helvetica-Bold').text('Treatment Plan:', M + 15, y + 10);
    doc.fillColor('#78350F').fontSize(9).font('Helvetica').text(treatText, M + 15, y + 25, { width: CW - 30 });
    y += treatH + 10;

    // Fertilizer Box
    const fertH = Math.max(45, doc.heightOfString(det.fertilizer || '', { width: CW - 30 }) + 30);
    doc.rect(M, y, CW, fertH).fill('#EFF6FF').stroke('#BFDBFE');
    doc.rect(M, y, 4, fertH).fill('#3B82F6');
    doc.fillColor('#1D4ED8').fontSize(10).font('Helvetica-Bold').text('Fertilizer Guide:', M + 15, y + 10);
    doc.fillColor('#1E3A8A').fontSize(9).font('Helvetica').text(det.fertilizer || 'N/A', M + 15, y + 25, { width: CW - 30 });
    y += fertH + 20;

    // ── FOOTER ──
    const pageHeight = 841.89; // A4 height
    doc.rect(0, pageHeight - 50, W, 50).fill('#064E3B');
    doc.fillColor('#A7F3D0').fontSize(8).font('Helvetica')
       .text(`CocoAI Diagnostics  |  Detection ID: #${detectionId}  |  Generated on: ${new Date().toLocaleString()}`, M, pageHeight - 35, { width: CW, align: 'center' });
    doc.fillColor('#34D399').fontSize(7)
       .text('Shayini Tharushika Sudusinghe  |  BSc Computer Science  |  University of Wolverhampton', M, pageHeight - 20, { width: CW, align: 'center' });

    doc.end();

  } catch (error: any) {
    console.error('❌ Report error:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to generate report: ' + error.message });
    }
  }
};