import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Upload from './components/Upload';
import Results from './components/Results';
import Login from './components/Login';

const theme = createTheme({
  palette: { mode: 'light' },  // Switch to 'dark' if needed
  breakpoints: { values: { xs: 0, sm: 600, md: 900 } },  // Responsive for mobile
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={isLoggedIn ? <Upload /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;