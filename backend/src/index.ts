import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, signup } from './controllers/authController';
import { uploadDocument, getDocuments, deleteDocument } from './controllers/docController';
import { askQuestion, getHistory, getDashboardStats } from './controllers/aiController';
import { authMiddleware } from './middleware/auth';
import { upload } from './middleware/upload';

dotenv.config();
const applicationInstance = express();

applicationInstance.use(cors({ origin: '*' }));
applicationInstance.use(express.json());

// Identity Endpoint Routing
applicationInstance.post('/api/signup', signup);
applicationInstance.post('/api/login', login);

// Data Structure Processing Core Routes
applicationInstance.post('/api/documents', authMiddleware, upload.single('file'), uploadDocument);
applicationInstance.get('/api/documents', authMiddleware, getDocuments);
applicationInstance.delete('/api/documents/:id', authMiddleware, deleteDocument);

// Query Context & Monitoring Operations
applicationInstance.post('/api/ask', authMiddleware, askQuestion);
applicationInstance.get('/api/history', authMiddleware, getHistory);
applicationInstance.get('/api/dashboard', authMiddleware, getDashboardStats);

const SYSTEM_PORT = process.env.PORT || 5000;
const DATABASE_CONNECTION_STRING = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kb-assistant';

mongoose.connect(DATABASE_CONNECTION_STRING)
    .then(() => {
        applicationInstance.listen(SYSTEM_PORT, () => {
            console.log(`[CORE EXECUTOR ONLINE]: Active state listening on infrastructure matrix port ${SYSTEM_PORT}`);
        });
    })
    .catch(connectionError => {
        console.error('[DATABASE PIPELINE SYSTEM CRITICAL EXCEPTION]:', connectionError);
    });