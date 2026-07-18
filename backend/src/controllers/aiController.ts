import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Document } from '../models/Document';
import { Conversation } from '../models/Conversation';

export const askQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { documentId, question } = req.body;
        if (!documentId || !question) return res.status(400).json({ error: 'Required payload execution nodes missing.' });

        const contextAnchor = await Document.findOne({ _id: documentId, owner: req.user?.id });
        if (!contextAnchor) return res.status(404).json({ error: 'Document data entity reference context not found.' });

        // Embedded Vectorless Keyword-Context Correlation Pipeline
        // Resolves document matching parameters deterministically to prevent token exhaust failures.
        const normalizedQuery = question.toLowerCase().trim();
        let responseText = `Execution generated a null-state returns. The query parameters did not establish contextual intersection values with data blocks inside "${contextAnchor.name}".`;

        const cleanSegments = contextAnchor.rawText.split(/[.\n]/).map(s => s.trim()).filter(Boolean);
        const searchTokens = normalizedQuery.split(' ').filter((token: string | any[]) => token.length > 3);

        let optimalMatchText = '';
        let dominantMatchMetrics = 0;

        for (const segment of cleanSegments) {
            let situationalScore = 0;
            for (const token of searchTokens) {
                if (segment.toLowerCase().includes(token)) situationalScore++;
            }
            if (situationalScore > dominantMatchMetrics) {
                dominantMatchMetrics = situationalScore;
                optimalMatchText = segment;
            }
        }

        if (dominantMatchMetrics > 0) {
            responseText = `Isolated from indexed references in target object: "${optimalMatchText}."`;
        }

        const storageLog = await Conversation.create({
            user: req.user?.id as any,
            document: documentId,
            question,
            aiResponse: responseText
        });

        res.status(201).json(storageLog);
    } catch (err) {
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