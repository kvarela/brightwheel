import { Box, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react'
import { BwButton } from '../../../components/BwButton'
import { Loader } from '../../../components/Loader'

interface ClearKnowledgeBaseDialogProps {
  isOpen: boolean
  isClearing: boolean
  errorMessage: string | null
  entryCount: number
  onCancel: () => void
  onConfirm: () => void
}

export function ClearKnowledgeBaseDialog({
  isOpen,
  isClearing,
  errorMessage,
  entryCount,
  onCancel,
  onConfirm,
}: ClearKnowledgeBaseDialogProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open && !isClearing) onCancel()
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
                disabled={isClearing}
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
                Clear knowledge base?
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pt="0">
              <Text fontSize="14px" color="#18181D" mb="2">
                This will permanently delete{' '}
                <Text as="span" fontWeight={600}>
                  all {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </Text>{' '}
                from your knowledge base, including base inquiries and entries
                imported from handbook uploads.
              </Text>
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
                  disabled={isClearing}
                  px="6"
                >
                  Cancel
                </BwButton>
                <BwButton
                  onClick={onConfirm}
                  disabled={isClearing || entryCount === 0}
                  bg="#CF193A"
                  color="white"
                  _hover={{ bg: '#B31532' }}
                  _active={{ bg: '#971028' }}
                  px="6"
                >
                  {isClearing ? <Loader size="sm" text="Clearing…" inline /> : 'Clear all'}
                </BwButton>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
