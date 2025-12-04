import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(credentials);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          margin="normal"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Login</Button>
      </form>
    </Container>
  );
};

export default Login;