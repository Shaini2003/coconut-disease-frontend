// Backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'farmer']
    );

    const token = jwt.sign(
      { userId: result.insertId, email, role: role || 'farmer' },
      process.env.JWT_SECRET || 'coconut_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: result.insertId, name, email, role: role || 'farmer' },
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'coconut_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// ── GET /api/auth/profile ─────────────────────────────────────────────────────
export const getProfile = async (req: any, res: Response) => {
  try {
    const [users]: any = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: users[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};