import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Coconut Disease Predictor</Typography>
        {isLoggedIn ? (
          <>
            <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
            <Button color="inherit" onClick={onLogout}>Logout</Button>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;