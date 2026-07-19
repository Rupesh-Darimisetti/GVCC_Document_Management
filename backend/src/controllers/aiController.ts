import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Document } from '../models/Document';
import { Conversation } from '../models/Conversation';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client SDK. It automatically loads the process.env.GEMINI_API_KEY
const ai = new GoogleGenAI();

export const askQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { documentId, question } = req.body;
        if (!documentId || !question) {
            return res.status(400).json({ error: 'Required payload parameters (documentId, question) are missing.' });
        }

        // 1. Fetch the user's uploaded document from the database
        const contextAnchor = await Document.findOne({ _id: documentId, owner: req.user?.id });
        if (!contextAnchor) {
            return res.status(404).json({ error: 'Document reference context not found or unauthorized.' });
        }

        // 2. Build a context-aware prompt passing the document text directly to the AI model
        const userPrompt = `
You are an intelligent knowledge base assistant. Answer the user's question accurately using ONLY the provided document text as your source context. If the answer cannot be found or inferred from the text, state clearly that the document doesn't contain this information.

---
DOCUMENT NAME: ${contextAnchor.name}
DOCUMENT CONTENT:
${contextAnchor.rawText}
---

USER QUESTION: ${question}
ANSWER:
        `;

        // 3. Request inference generation using the performant gemini-2.5-flash model
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
        });

        const responseText = aiResponse.text || "The AI model generated an empty response frame.";

        // 4. Record the interaction ledger history inside MongoDB
        const storageLog = await Conversation.create({
            user: req.user?.id as any,
            document: documentId,
            question,
            aiResponse: responseText
        });

        // Return the fresh conversation object back to the UI interface
        res.status(201).json(storageLog);
    } catch (err: any) {
        console.error('AI Generation System Fault:', err);
        res.status(500).json({ error: 'AI Context inference computation processing fault.' });
    }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;
        let processingFilter: any = { user: req.user?.id };

        if (search) {
            processingFilter.$or = [
                { question: { $regex: search, $options: 'i' } },
                { aiResponse: { $regex: search, $options: 'i' } }
            ];
        }

        const conversationHistoryTree = await Conversation.find(processingFilter)
            .populate('document', 'name')
            .sort({ createdAt: -1 });
        res.json(conversationHistoryTree);
    } catch (err) {
        res.status(500).json({ error: 'Failed indexing context history pipelines.' });
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const currentIdentity = req.user?.id;
        const documentVolumeCount = await Document.countDocuments({ owner: currentIdentity });
        const standardQuestionCount = await Conversation.countDocuments({ user: currentIdentity });
        const modernUploadChronologyList = await Document.find({ owner: currentIdentity })
            .select('name createdAt fileSize fileType')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalDocs: documentVolumeCount,
            totalQuestions: standardQuestionCount,
            recentUploads: modernUploadChronologyList
        });
    } catch (err) {
        res.status(500).json({ error: 'Aggregate generation framework error.' });
    }
};