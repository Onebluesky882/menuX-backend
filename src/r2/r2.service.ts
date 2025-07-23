import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import type { MultipartFile } from '@fastify/multipart';

@Injectable()
export class R2Service {
  private s3!: S3Client;
  private bucket!: string;

  constructor(private configService: ConfigService) {
    if (
      !process.env.R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY
    ) {
      console.error('R2 some value missing');
      return;
    }

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: configService.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: configService.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: configService.get('R2_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucket = configService.get('R2_BUCKET')!;
  }

  async uploadFile(file: MultipartFile) {
    // แปลงไฟล์เป็น buffer
    const buffer = await file.toBuffer();

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: file.filename, // filename ใน MultipartFile (ไม่ใช่ originalname)
      Body: buffer,
      ContentType: file.mimetype,
    });
    await this.s3.send(command);

    const publicUrl = this.configService.get('R2_PUBLIC');

    return `${publicUrl}/${file.filename}`;
  }
}
