import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password metrics are required.' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ error: 'Malformed email identification format.' });
        if (password.length < 6) return res.status(400).json({ error: 'Security key matrix must contain >= 6 characters.' });

        const baseUser = await User.findOne({ email });
        if (baseUser) return res.status(400).json({ error: 'Identity collision. User instance already registered.' });

        const securePassword = await bcrypt.hash(password, 12);
        const user = await User.create({ email, password: securePassword });

        const sessionToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        res.status(201).json({ token: sessionToken, email: user.email });
    } catch (err) {
        res.status(500).json({ error: 'Internal pipeline fault during identity creation.' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid security context matching credentials.' });

        const keyVerification = await bcrypt.compare(password, user.password);
        if (!keyVerification) return res.status(400).json({ error: 'Invalid security context matching credentials.' });

        const sessionToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        res.json({ token: sessionToken, email: user.email });
    } catch (err) {
        res.status(500).json({ error: 'Internal authentication server fault.' });
    }
};