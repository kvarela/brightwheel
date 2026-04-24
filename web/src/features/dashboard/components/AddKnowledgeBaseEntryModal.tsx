import { useEffect, useState } from 'react'
import { Box, CloseButton, Dialog, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { BwButton } from '../../../components/BwButton'
import { Loader } from '../../../components/Loader'
import { useCreateKnowledgeBaseEntry } from '../hooks/useCreateKnowledgeBaseEntry'

interface AddKnowledgeBaseEntryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddKnowledgeBaseEntryModal({ isOpen, onClose }: AddKnowledgeBaseEntryModalProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useCreateKnowledgeBaseEntry()

  useEffect(() => {
    if (!isOpen) {
      setQuestion('')
      setAnswer('')
      setError(null)
    }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedQuestion = question.trim()
    const trimmedAnswer = answer.trim()

    if (!trimmedQuestion || !trimmedAnswer) {
      setError('Both question and answer are required.')
      return
    }

    try {
      await mutateAsync({ question: trimmedQuestion, answer: trimmedAnswer })
      onClose()
    } catch {
      setError('Failed to create entry. Please try again.')
    }
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2px"
            p="8"
            maxW="560px"
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
                _hover={{ color: '#18181D' }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Header pb="6">
              <Dialog.Title
                fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                fontSize="22px"
                fontWeight="600"
                color="#1E2549"
              >
                Add Knowledge Base Entry
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pt="0">
              <Box as="form" onSubmit={handleSubmit}>
                <Box mb="4">
                  <Text fontSize="14px" fontWeight="500" color="#5C5E6A" mb="1">
                    Question
                  </Text>
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What are the hours of operation?"
                    border="1px solid #EBEFF4"
                    borderRadius="2px"
                    px="4"
                    py="3"
                    fontSize="16px"
                    color="#18181D"
                    bg="white"
                    _placeholder={{ color: '#737685' }}
                    _focus={{
                      borderColor: '#5463D6',
                      boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
                      outline: 'none',
                    }}
                    maxLength={1000}
                  />
                </Box>

                <Box mb="6">
                  <Text fontSize="14px" fontWeight="500" color="#5C5E6A" mb="1">
                    Answer
                  </Text>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write the answer parents should receive…"
                    border="1px solid #EBEFF4"
                    borderRadius="2px"
                    px="4"
                    py="3"
                    fontSize="16px"
                    color="#18181D"
                    bg="white"
                    minHeight="140px"
                    resize="vertical"
                    _placeholder={{ color: '#737685' }}
                    _focus={{
                      borderColor: '#5463D6',
                      boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
                      outline: 'none',
                    }}
                    maxLength={5000}
                  />
                </Box>

                {error && (
                  <Box
                    bg="#FFF6F5"
                    border="1px solid #CF193A"
                    borderRadius="2px"
                    p="3"
                    mb="4"
                  >
                    <Text color="#CF193A" fontSize="14px">
                      {error}
                    </Text>
                  </Box>
                )}

                <Box display="flex" gap="12px" justifyContent="flex-end">
                  <BwButton
                    type="button"
                    variant="secondary"
                    px="5"
                    py="3"
                    fontSize="14px"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </BwButton>
                  <BwButton
                    type="submit"
                    px="5"
                    py="3"
                    fontSize="14px"
                    disabled={isPending}
                  >
                    {isPending ? <Loader size="sm" text="Saving…" inline /> : 'Add Entry'}
                  </BwButton>
                </Box>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
