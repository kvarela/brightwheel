import { Box, Badge, Text, Spinner, Stack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useHandbookUploads } from '../hooks/useHandbookUploads'
import { HandbookUpload, HandbookUploadStatus } from '../types/HandbookUpload'

const STATUS_CONFIG: Record<
  HandbookUploadStatus,
  { label: string; bg: string; color: string }
> = {
  pending: { label: 'Pending', bg: '#F7F9FB', color: '#5C5E6A' },
  processing: { label: 'Processing', bg: '#FFF9E5', color: '#896507' },
  completed: { label: 'Completed', bg: '#E9F8EF', color: '#3BBA6E' },
  failed: { label: 'Failed', bg: '#FFF6F5', color: '#CF193A' },
}

function StatusBadge({ status }: { status: HandbookUploadStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge
      px="8px"
      py="2px"
      borderRadius="2px"
      bg={cfg.bg}
      color={cfg.color}
      fontSize="12px"
      fontWeight={600}
      textTransform="uppercase"
    >
      {cfg.label}
    </Badge>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function UploadRow({ upload, first }: { upload: HandbookUpload; first: boolean }) {
  return (
    <Box
      py="14px"
      borderTop={first ? 'none' : '1px solid #EBEFF4'}
      display="flex"
      alignItems="flex-start"
      justifyContent="space-between"
      flexWrap="wrap"
      gap="8px"
    >
      <Box>
        <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
          <Text fontSize="14px" fontWeight={600} color="#18181D">
            {upload.fileName}
          </Text>
          <Text
            fontSize="12px"
            color="#737685"
            textTransform="uppercase"
            fontWeight={500}
          >
            {upload.fileType}
          </Text>
          <StatusBadge status={upload.status} />
        </Box>
        {upload.errorMessage && (
          <Text fontSize="12px" color="#CF193A" mt="4px">
            {upload.errorMessage}
          </Text>
        )}
        <Text fontSize="12px" color="#5C5E6A" mt="4px">
          Uploaded by {upload.uploadedBy.fullName}
        </Text>
      </Box>
      <Text fontSize="12px" color="#737685" whiteSpace="nowrap">
        {formatDate(upload.createdAt)}
      </Text>
    </Box>
  )
}

export function HandbookUploadsSection({ fullPage }: { fullPage?: boolean }) {
  const navigate = useNavigate()
  const { data: uploads, isLoading, isError } = useHandbookUploads()

  return (
    <Box bg="white" borderRadius="2px" border="1px solid #EBEFF4" p="24px">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="16px">
        <Text
          fontSize="22px"
          fontWeight={600}
          color="#18181D"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Handbook Uploads
        </Text>
        {!fullPage && (
          <Box
            as="button"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="32px"
            height="32px"
            borderRadius="2px"
            border="none"
            bg="transparent"
            cursor="pointer"
            color="#737685"
            _hover={{ bg: '#F7F9FB', color: '#5463D6' }}
            transition="all 0.2s"
            onClick={() => navigate('/handbook')}
            title="Upload new handbook"
          >
            <Plus size={18} />
          </Box>
        )}
      </Box>

      {isLoading && (
        <Box display="flex" alignItems="center" gap="8px" color="#737685">
          <Spinner size="sm" color="#5463D6" />
          <Text fontSize="14px">Loading…</Text>
        </Box>
      )}

      {isError && (
        <Text fontSize="14px" color="#CF193A">
          Failed to load handbook uploads.
        </Text>
      )}

      {!isLoading && !isError && uploads?.length === 0 && (
        <Text fontSize="14px" color="#737685">
          No handbook uploads yet.
        </Text>
      )}

      {!isLoading && !isError && uploads && uploads.length > 0 && (
        <Stack gap="0">
          {uploads.map((upload, idx) => (
            <UploadRow key={upload.id} upload={upload} first={idx === 0} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
