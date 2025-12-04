import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { predictDisease } from '../utils/api';

const Upload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', acceptedFiles[0]);  // Assume single image upload

    try {
      const { data } = await predictDisease(formData);
      // Store result in localStorage for Results component, or pass via state
      localStorage.setItem('prediction', JSON.stringify(data));  // e.g., { label: 'Leaf Spot', confidence: 0.95, heatmap: 'base64_string' }
      navigate('/results');
    } catch (err) {
      setError('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
  });

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Coconut Leaf/Tree Image</Typography>
      <Typography variant="body1" gutterBottom>
        Drag & drop an image or click to select. Early detection saves your crop!
      </Typography>
      <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '50px', margin: '20px 0', borderRadius: 8 }}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <p>Click or drag an image (JPG/PNG)</p>
        )}
      </div>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <CircularProgress />}
      <Button variant="contained" onClick={() => {}} disabled>  {/* Placeholder for manual upload if needed */}
        Or Select File
      </Button>
    </Container>
  );
};

export default Upload;