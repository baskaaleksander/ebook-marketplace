import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new Error('File not received!');
      }
    
      return {
        message: 'File uploaded successfully',
        filename: file.filename,
        url: `/uploads/${file.filename}`,
      };
    }
    }