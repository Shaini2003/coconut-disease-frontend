// Backend/src/controllers/reportController.ts

import { Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import pool from '../config/db';

const SEVERITY_RGB: Record<string, [number, number, number]> = {
  Critical: [220, 38,  38],
  High:     [234, 88,  12],
  Medium:   [202, 138,  4],
  None:     [22,  163, 74],
  Unknown:  [107, 114, 128],
};

const SEVERITY_MAP: Record<string, string> = {
  'Bud Root Dropping':      'High',
  'Bud Rot':                'Critical',
  'CCI_Caterpillars':       'Medium',
  'Gray Leaf Spot':         'Medium',
  'Healthy_Leaves':         'None',
  'Leaf Rot':               'High',
  'Stem Bleeding':          'Critical',
  'WCLWD_DryingofLeaflets': 'Critical',
};

const FERTILIZER_MAP: Record<string, string> = {
  'Bud Root Dropping':      'Apply potassium-rich fertilizer MOP (0-0-60) at 500g per tree. Avoid excess nitrogen.',
  'Bud Rot':                'Apply balanced NPK 12-12-17 with magnesium sulphate. Avoid over-irrigation.',
  'CCI_Caterpillars':       'Apply nitrogen fertilizer Urea (46%) at 200g per tree to boost leaf regrowth.',
  'Gray Leaf Spot':         'Apply potassium sulphate (0-0-50) to strengthen cell walls. Supplement with zinc.',
  'Healthy_Leaves':         'Apply balanced NPK 14-14-14 at 500g per tree every 3 months.',
  'Leaf Rot':               'Apply calcium nitrate (15.5-0-0) to strengthen leaf tissue.',
  'Stem Bleeding':          'Apply balanced fertilizer with boron and copper micronutrients.',
  'WCLWD_DryingofLeaflets': 'Apply organic manure and balanced NPK. Intercrop with legumes.',
};

const XAI_TEXT: Record<string, string> = {
  'Bud Root Dropping':      'The model identified root zone stress and frond discoloration. Grad-CAM highlights lower frond regions where early root stress symptoms appear.',
  'Bud Rot':                'Irregular dark discoloration in the crown region was detected. The heatmap highlights the bud and inner spear leaves where Phytophthora palmivora infection typically begins.',
  'CCI_Caterpillars':       'Irregular feeding damage patterns on leaflet surfaces were detected. The model focused on the areas showing characteristic caterpillar damage textures.',
  'Gray Leaf Spot':         'Circular gray-brown spots with yellow halos were detected. The model concentrated on spot distribution patterns consistent with Pestalotiopsis palmarum infection.',
  'Healthy_Leaves':         'Uniform green coloration with normal leaf texture was found. No disease indicators present in any region of the leaf image.',
  'Leaf Rot':               'Brown water-soaked lesions spreading from leaflet tips were identified. The heatmap focuses on rotting tissue boundaries where fungal activity is highest.',
  'Stem Bleeding':          'Abnormal browning and texture changes were detected. Highlighted regions show trunk surface irregularities characteristic of Thielaviopsis paradoxa.',
  'WCLWD_DryingofLeaflets': 'Progressive yellowing from leaflet tips was identified — a hallmark of phytoplasma infection. The model highlighted the systematic drying pattern spreading upward.',
};

// ── GET /api/report/:detectionId ──────────────────────────────────────────────
export const generateReport = async (req: any, res: Response) => {
  try {
    const { detectionId } = req.params;

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
    const severity   = SEVERITY_MAP[det.predicted_disease] || 'Unknown';
    const sevRgb     = SEVERITY_RGB[severity] || SEVERITY_RGB['Unknown'];
    const fertilizer = FERTILIZER_MAP[det.predicted_disease] || 'Apply balanced NPK fertilizer.';
    const xaiText    = XAI_TEXT[det.predicted_disease] || 'The AI model analysed visual patterns in the leaf image to classify this disease.';
    const confidence = parseFloat(det.confidence).toFixed(1);
    const detectedAt = new Date(det.created_at);

    // ── Build PDF ──────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CocoAI_Report_${detectionId}.pdf"`);
    doc.pipe(res);

    const W  = 595;
    const M  = 50;
    const CW = W - M * 2;

    // Header
    doc.rect(0, 0, W, 80).fill('#1B4332');
    doc.rect(0, 80, W, 4).fill('#52B788');
    doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
       .text('CocoAI Disease Detection Report', M, 18, { width: CW });
    doc.fillColor('#A7F3D0').fontSize(10).font('Helvetica')
       .text('AI-Powered Coconut Disease Detection  |  University of Wolverhampton', M, 48, { width: CW });

    let y = 98;

    // Report meta box
    doc.rect(M, y, CW, 75).fill('#F8FBF8').stroke('#D8F3DC');
    doc.fillColor('#1B4332').fontSize(9).font('Helvetica-Bold')
       .text('Report ID:',        M + 12, y + 10)
       .text('Generated:',        M + 12, y + 24)
       .text('Detection Date:',   M + 12, y + 38)
       .text('Farmer / Officer:', M + 12, y + 52);
    doc.fillColor('#374151').font('Helvetica').fontSize(9)
       .text(`RPT-${detectionId}-${Date.now()}`,                             M + 110, y + 10)
       .text(new Date().toLocaleString('en-GB'),                             M + 110, y + 24)
       .text(detectedAt.toLocaleString('en-GB'),                             M + 110, y + 38)
       .text(`${det.user_name}  |  ${det.user_email}  |  ${det.user_role}`, M + 110, y + 52);
    y += 90;

    // Detection result box
    doc.rect(M, y, CW, 95).fill('#FFFFFF').stroke('#E5E7EB');
    doc.rect(M, y, 5, 95).fill(`rgb(${sevRgb.join(',')})`);
    doc.fillColor('#1B4332').fontSize(10).font('Helvetica-Bold')
       .text('DETECTION RESULT', M + 14, y + 10);
    doc.fillColor('#111827').fontSize(18).font('Helvetica-Bold')
       .text(det.predicted_disease.replace(/_/g, ' '), M + 14, y + 26);
    // Severity badge
    doc.rect(M + 14, y + 58, 80, 18).fill(`rgb(${sevRgb.join(',')})`);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
       .text(severity.toUpperCase(), M + 18, y + 63);
    // Confidence
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
       .text('Confidence Level:', M + 120, y + 58);
    doc.fillColor('#059669').fontSize(16).font('Helvetica-Bold')
       .text(`${confidence}%`, M + 230, y + 54);
    // Confidence bar
    doc.rect(M + 14, y + 82, CW - 28, 5).fill('#E5E7EB');
    const barW = Math.min((parseFloat(confidence) / 100) * (CW - 28), CW - 28);
    doc.rect(M + 14, y + 82, barW, 5).fill('#059669');
    y += 108;

    // Images
    const imgPath = det.image_url
      ? path.join(__dirname, '../../', det.image_url)
      : null;
    let imagesDrawn = false;

    if (imgPath && fs.existsSync(imgPath)) {
      doc.fillColor('#1B4332').fontSize(9).font('Helvetica-Bold').text('Uploaded Leaf Image', M, y);
      y += 14;
      try { doc.image(imgPath, M, y, { width: 170, height: 130 }); imagesDrawn = true; } catch {}
    }

    if (det.gradcam_url) {
      const gcPath = path.join(__dirname, '../../../ML_Model/gradcam_outputs', path.basename(det.gradcam_url));
      if (fs.existsSync(gcPath)) {
        const gcX = imagesDrawn ? M + 190 : M;
        if (!imagesDrawn) { doc.fillColor('#1B4332').fontSize(9).font('Helvetica-Bold').text('Grad-CAM Heatmap (XAI)', gcX, y); y += 14; }
        else { doc.fillColor('#1B4332').fontSize(9).font('Helvetica-Bold').text('Grad-CAM Heatmap (XAI)', gcX, y - 14); }
        try {
          doc.image(gcPath, gcX, y, { width: 170, height: 130 });
          doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Oblique').text('Red/yellow = highest AI attention', gcX, y + 133, { width: 170 });
          imagesDrawn = true;
        } catch {}
      }
    }

    if (imagesDrawn) y += 150;

    // XAI explanation
    const xaiH = Math.max(65, doc.heightOfString(xaiText, { width: CW - 28 }) + 42);
    doc.rect(M, y, CW, xaiH).fill('#F5F3FF').stroke('#DDD6FE');
    doc.rect(M, y, 4, xaiH).fill('#7C3AED');
    doc.fillColor('#5B21B6').fontSize(10).font('Helvetica-Bold').text('Explainable AI (XAI) — Grad-CAM Method', M + 12, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text(xaiText, M + 12, y + 26, { width: CW - 28, lineGap: 2 });
    y += xaiH + 8;

    // Treatment
    const treatText = det.recommendation || 'Consult an agricultural expert.';
    const treatH    = Math.max(60, doc.heightOfString(treatText, { width: CW - 28 }) + 40);
    doc.rect(M, y, CW, treatH).fill('#FFF7ED').stroke('#FED7AA');
    doc.rect(M, y, 4, treatH).fill('#F59E0B');
    doc.fillColor('#92400E').fontSize(10).font('Helvetica-Bold').text('Treatment Recommendation', M + 12, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text(treatText, M + 12, y + 26, { width: CW - 28, lineGap: 2 });
    y += treatH + 8;

    // Fertilizer
    const fertH = Math.max(55, doc.heightOfString(fertilizer, { width: CW - 28 }) + 40);
    doc.rect(M, y, CW, fertH).fill('#F0FDF4').stroke('#BBF7D0');
    doc.rect(M, y, 4, fertH).fill('#22C55E');
    doc.fillColor('#166534').fontSize(10).font('Helvetica-Bold').text('Fertilizer Recommendation', M + 12, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text(fertilizer, M + 12, y + 26, { width: CW - 28, lineGap: 2 });
    y += fertH + 8;

    // Disclaimer
    if (y > 720) { doc.addPage(); y = 50; }
    doc.rect(M, y, CW, 44).fill('#F9FAFB').stroke('#E5E7EB');
    doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Oblique')
       .text('⚠️  Disclaimer: This report is generated by an AI system for guidance only. For Critical diseases (Bud Rot, Stem Bleeding, WCLWD), always consult the Coconut Research Institute of Sri Lanka (CRISL). This does not replace professional agricultural advice.', M + 10, y + 8, { width: CW - 20, lineGap: 2 });

    // Footer
    doc.rect(0, 782, W, 60).fill('#1B4332');
    doc.fillColor('#D8F3DC').fontSize(8).font('Helvetica')
       .text(`CocoAI System  |  Detection ID: #${detectionId}  |  Generated: ${new Date().toLocaleString()}`, M, 796, { width: CW, align: 'center' });
    doc.fillColor('#52B788').fontSize(7)
       .text('Shayini Tharushika Sudusinghe  |  BSc Computer Science  |  University of Wolverhampton', M, 812, { width: CW, align: 'center' });

    doc.end();

  } catch (error: any) {
    console.error('❌ Report error:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to generate report: ' + error.message });
    }
  }
};