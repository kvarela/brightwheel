import { Box, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react'
import { BwButton } from '../../../components/BwButton'
import { Loader } from '../../../components/Loader'
import { HandbookUpload } from '../types/HandbookUpload'

interface DeleteHandbookUploadDialogProps {
  upload: HandbookUpload | null
  isDeleting: boolean
  errorMessage: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteHandbookUploadDialog({
  upload,
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteHandbookUploadDialogProps) {
  const isOpen = upload !== null

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open && !isDeleting) onCancel()
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2px"
            p="8"
            maxW="440px"
            w="full"
            boxShadow="0 8px 32px rgba(0,0,0,0.12)"
          >
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top="4"
                right="4"
                color="#5C5E6A"
                disabled={isDeleting}
                _hover={{ color: '#18181D' }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Header pb="4">
              <Dialog.Title
                fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                fontSize="22px"
                fontWeight="600"
                color="#1E2549"
              >
                Delete handbook upload?
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pt="0">
              <Text fontSize="14px" color="#18181D" mb="2">
                This will permanently remove the following upload:
              </Text>
              {upload && (
                <Text
                  fontSize="14px"
                  fontWeight={600}
                  color="#18181D"
                  mb="4"
                  wordBreak="break-all"
                >
                  {upload.fileName}
                </Text>
              )}
              <Text fontSize="14px" color="#5C5E6A" mb="6">
                This action cannot be undone.
              </Text>

              {errorMessage && (
                <Box
                  bg="#FFF6F5"
                  border="1px solid #CF193A"
                  borderRadius="2px"
                  p="3"
                  mb="4"
                >
                  <Text color="#CF193A" fontSize="14px">
                    {errorMessage}
                  </Text>
                </Box>
              )}

              <Box display="flex" gap="3" justifyContent="flex-end">
                <BwButton
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isDeleting}
                  px="6"
                >
                  Cancel
                </BwButton>
                <BwButton
                  onClick={onConfirm}
                  disabled={isDeleting}
                  bg="#CF193A"
                  color="white"
                  _hover={{ bg: '#B31532' }}
                  _active={{ bg: '#971028' }}
                  px="6"
                >
                  {isDeleting ? <Loader size="sm" text="Deleting…" inline /> : 'Delete'}
                </BwButton>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
