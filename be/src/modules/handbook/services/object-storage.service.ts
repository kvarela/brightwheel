import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const UPLOAD_URL_TTL_SECONDS = 15 * 60
const DOWNLOAD_URL_TTL_SECONDS = 5 * 60

@Injectable()
export class ObjectStorageService {
  private readonly client: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('RENDER_STORAGE_ENDPOINT')
    const region = this.configService.get<string>('RENDER_STORAGE_REGION') ?? 'us-east-1'
    const accessKeyId = this.configService.get<string>('RENDER_STORAGE_ACCESS_KEY') ?? ''
    const secretAccessKey = this.configService.get<string>('RENDER_STORAGE_SECRET_KEY') ?? ''
    this.bucket = this.configService.get<string>('RENDER_STORAGE_BUCKET') ?? 'brightwheel-handbooks'

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async createSignedUploadUrl(
    fileKey: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; expiresInSeconds: number }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: contentType,
    })
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    })
    return { uploadUrl, expiresInSeconds: UPLOAD_URL_TTL_SECONDS }
  }

  async downloadObject(fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: fileKey })
    const response = await this.client.send(command)
    if (!response.Body) {
      throw new Error(`Object ${fileKey} is empty`)
    }
    return Buffer.from(await response.Body.transformToByteArray())
  }

  async createSignedDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: fileKey })
    return getSignedUrl(this.client, command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS })
  }

  buildHandbookFileKey(schoolId: string, uploadId: string, fileName: string): string {
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `schools/${schoolId}/handbooks/${uploadId}/${sanitized}`
  }
}
