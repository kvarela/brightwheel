import axios from 'axios'
import {
  HandbookProcessResponseDto,
  HandbookSignedUploadRequestDto,
  HandbookSignedUploadResponseDto,
  HandbookUploadDetailDto,
  HandbookUploadStatusResponseDto,
} from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'

export async function createSignedUpload(
  request: HandbookSignedUploadRequestDto,
): Promise<HandbookSignedUploadResponseDto> {
  const response = await apiClient.post<HandbookSignedUploadResponseDto>(
    '/api/handbook/uploads/signed-url',
    request,
  )
  return response.data
}

export async function uploadFileToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (evt) => {
      if (evt.total && evt.total > 0) {
        onProgress(Math.min(100, Math.round((evt.loaded / evt.total) * 100)))
      }
    },
  })
}

export async function processHandbookUpload(
  uploadId: string,
): Promise<HandbookProcessResponseDto> {
  const response = await apiClient.post<HandbookProcessResponseDto>(
    '/api/handbook/uploads/process',
    { uploadId },
  )
  return response.data
}

export async function getHandbookUploadStatus(
  uploadId: string,
): Promise<HandbookUploadStatusResponseDto> {
  const response = await apiClient.get<HandbookUploadStatusResponseDto>(
    `/api/handbook/uploads/${uploadId}`,
  )
  return response.data
}

export async function getHandbookUploadDetail(
  uploadId: string,
): Promise<HandbookUploadDetailDto> {
  const response = await apiClient.get<HandbookUploadDetailDto>(
    `/api/handbook/uploads/${uploadId}/detail`,
  )
  return response.data
}
