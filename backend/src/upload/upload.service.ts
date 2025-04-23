import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';


@Injectable()
export class UploadService {
    private s3: S3;
    private bucket: string;
    constructor(
        private configService: ConfigService,
    ) {
        this.s3 = new S3({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            }
        })

        this.bucket = this.configService.get('AWS_S3_BUCKET_NAME') || '';
    }

    async uploadFile(file: Express.Multer.File) {
    const fileKey = `${uuid()}-${file.originalname}`;

    await this.s3
      .upload({
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return {
        message: 'File uploaded successfully',
        filename: fileKey,
        url: `https://${this.bucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileKey}`,
    };
    }
}
