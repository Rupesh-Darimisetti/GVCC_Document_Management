import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB Safety Buffer
    fileFilter: (req: Request, file, cb) => {
        const allowedMimeTypes = ['application/pdf', 'text/plain', 'text/markdown'];
        const isMarkdownExtension = file.originalname.endsWith('.md');

        if (allowedMimeTypes.includes(file.mimetype) || isMarkdownExtension) {
            cb(null, true);
        } else {
            cb(new Error('Rejected payload. Framework accepts only validated .pdf, .txt, or .md components.'));
        }
    }
});