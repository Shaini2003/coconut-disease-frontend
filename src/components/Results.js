import React, { useState, useEffect } from 'react';
import { Container, Typography, Chip, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Results = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('prediction');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/');  // Redirect if no result
    }
  }, [navigate]);

  if (!result) return <Typography>Loading...</Typography>;

  // Simple canvas overlay for Grad-CAM heatmap (assumes backend returns base64 heatmap image)
  const drawHeatmapOverlay = (originalImgSrc, heatmapSrc) => {
    const canvas = document.getElementById('heatmap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const heat = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      heat.onload = () => {
        ctx.globalAlpha = 0.4;  // Transparency for overlay
        ctx.drawImage(heat, 0, 0, canvas.width, canvas.height);
      };
      heat.src = heatmapSrc;
    };
    img.src = originalImgSrc;  // You'd store original image in localStorage too
  };

  useEffect(() => {
    if (result && result.originalImage && result.heatmap) {
      drawHeatmapOverlay(result.originalImage, result.heatmap);
    }
  }, [result]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Prediction Results</Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5">Detected Disease: {result.label}</Typography>
        <Chip label={`Confidence: ${(result.confidence * 100).toFixed(1)}%`} color="primary" sx={{ mt: 1 }} />
        <Typography variant="body1" sx={{ mt: 2 }}>Explanation: The model focused on yellowing spots and vein discoloration (highlighted in red overlay).</Typography>
        
        <Box sx={{ mt: 3 }}>
          <canvas id="heatmap-canvas" style={{ border: '1px solid #ddd', maxWidth: '100%' }} />
          <Typography variant="caption">Red areas indicate disease hotspots (Grad-CAM explanation).</Typography>
        </Box>
        
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>Upload Another Image</Button>
      </Paper>
    </Container>
  );
};

export default Results;