import { useCallback, useState } from 'react'
import { ExtractedInquiryDto } from '@brightwheel/shared'
import {
  createSignedUpload,
  processHandbookUpload,
  uploadFileToSignedUrl,
} from '../api/handbookApi'
import { classifyHandbookFile } from '../utils/classifyHandbookFile'
import { HandbookUploadPhase } from '../types/handbookUploadPhase'

interface UseHandbookUploadState {
  phase: HandbookUploadPhase
  uploadProgress: number
  errorMessage: string | null
  inquiries: ExtractedInquiryDto[]
  fileName: string | null
}

const INITIAL_STATE: UseHandbookUploadState = {
  phase: 'idle',
  uploadProgress: 0,
  errorMessage: null,
  inquiries: [],
  fileName: null,
}

export function useHandbookUpload() {
  const [state, setState] = useState<UseHandbookUploadState>(INITIAL_STATE)

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  const uploadHandbook = useCallback(async (file: File) => {
    const classified = classifyHandbookFile(file)
    if (!classified) {
      setState({
        ...INITIAL_STATE,
        phase: 'error',
        errorMessage: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
        fileName: file.name,
      })
      return
    }

    setState({
      phase: 'requesting-url',
      uploadProgress: 0,
      errorMessage: null,
      inquiries: [],
      fileName: file.name,
    })

    try {
      const signed = await createSignedUpload({
        fileName: file.name,
        fileType: classified.fileType,
        contentType: classified.contentType,
      })

      setState((prev) => ({ ...prev, phase: 'uploading' }))
      await uploadFileToSignedUrl(signed.uploadUrl, file, (percent) =>
        setState((prev) => ({ ...prev, uploadProgress: percent })),
      )

      setState((prev) => ({ ...prev, phase: 'processing', uploadProgress: 100 }))
      const result = await processHandbookUpload(signed.uploadId)

      setState({
        phase: 'complete',
        uploadProgress: 100,
        errorMessage: null,
        inquiries: result.inquiries,
        fileName: file.name,
      })
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as Error).message ||
        'Something went wrong uploading the handbook.'
      setState((prev) => ({
        ...prev,
        phase: 'error',
        errorMessage: message,
      }))
    }
  }, [])

  return { ...state, uploadHandbook, reset }
}
