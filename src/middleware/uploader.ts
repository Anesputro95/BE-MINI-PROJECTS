import { Request } from 'express';
import multer from 'multer';

export const uploadMemory = () => {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB
        },
        fileFilter: (req: Request, file: Express.Multer.File, callback) => {
            const allowedExt = /\.(jpg|jpeg|png|gif)$/;
            if (!allowedExt.test(file.originalname.toLowerCase())) {
                return callback(
                    new Error("Wrong file extention only (jpeg|jpg|png|gif)")
                );
            }
            callback(null, true);
        }
    })
}