import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Document } from '../models/Document';
import pdfParse from 'pdf-parse';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No validated file block attached to stream.' });

        let extractedText = '';
        const extension = req.file.originalname.split('.').pop()?.toLowerCase();

        if (extension === 'pdf') {
            const parsedPdfBuffer = await pdfParse(req.file.buffer);
            extractedText = parsedPdfBuffer.text;
        } else {
            extractedText = req.file.buffer.toString('utf-8');
        }

        if (!extractedText.trim()) {
            return res.status(400).json({ error: 'Failed processing file object. No extractable alphanumeric text layers present.' });
        }

        const typeMapping: Record<string, 'pdf' | 'txt' | 'md'> = { pdf: 'pdf', md: 'md', txt: 'txt' };
        const determinedType = typeMapping[extension || ''] || 'txt';

        const newDocument = await Document.create({
            name: req.file.originalname,
            fileType: determinedType,
            rawText: extractedText,
            fileSize: req.file.size,
            owner: req.user?.id as any
        });

        res.status(201).json({
            _id: newDocument._id,
            name: newDocument.name,
            fileType: newDocument.fileType,
            fileSize: newDocument.fileSize,
            createdAt: newDocument.createdAt
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Stream processing layer encountered an injection fault.' });
    }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;
        let buildFilter: any = { owner: req.user?.id };

        if (search) {
            buildFilter.name = { $regex: search, $options: 'i' };
        }

        const matchedCollection = await Document.find(buildFilter)
            .select('-rawText')
            .sort({ createdAt: -1 });
        res.json(matchedCollection);
    } catch (err) {
        res.status(500).json({ error: 'Database tracking sequence failed matching document schemas.' });
    }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
    try {
        const targetInstance = await Document.findOneAndDelete({ _id: req.params.id, owner: req.user?.id });
        if (!targetInstance) return res.status(404).json({ error: 'Target file allocation structure missing or out of context.' });
        res.json({ success: true, message: 'Data structural block isolated and wiped.' });
    } catch (err) {
        res.status(500).json({ error: 'Destruction execution handler failed.' });
    }
};