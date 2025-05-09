import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('File Upload')
@Controller('upload')
export class UploadController {
    constructor(private uploadService: UploadService) {}
  
    @ApiOperation({ summary: 'Upload a file (image or document)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload'
          }
        }
      }
    })
    @ApiResponse({
      status: 201,
      description: 'File uploaded successfully',
      schema: {
        example: {
          message: 'File uploaded successfully',
          filename: 'a1b2c3d4e5f6g7h8i9j0.pdf',
          url: 'https://example.com/uploads/a1b2c3d4e5f6g7h8i9j0.pdf'
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Invalid file or upload error' })
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
      
        return this.uploadService.uploadFile(file);
    }
    }