import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ExtractionConfidence } from '@brightwheel/shared'
import { HandbookParserService } from './handbook-parser.service'

function makeAnthropicResponse(text: string) {
  return {
    content: [{ type: 'text' as const, text }],
  }
}

function makeService(
  messagesCreate: jest.Mock,
): { service: HandbookParserService; messagesCreate: jest.Mock } {
  const service = new HandbookParserService(new ConfigService({}))
  // Replace the client with a mock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(service as any).client = { messages: { create: messagesCreate } }
  return { service, messagesCreate }
}

describe('HandbookParserService', () => {
  it('parses a valid inquiries payload', async () => {
    const messagesCreate = jest.fn().mockResolvedValue(
      makeAnthropicResponse(
        JSON.stringify({
          inquiries: [
            {
              question: 'What are your hours?',
              answer: 'We are open 7am-6pm Monday-Friday.',
              sourceExcerpt: 'Hours: 7:00 AM – 6:00 PM, Mon–Fri.',
              confidence: 'high',
            },
            {
              question: 'Do you provide meals?',
              answer: 'Yes, lunch and two snacks are included in tuition.',
              sourceExcerpt: null,
              confidence: 'medium',
            },
          ],
        }),
      ),
    )
    const { service } = makeService(messagesCreate)

    const result = await service.extractInquiries('Handbook text goes here.')

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      question: 'What are your hours?',
      answer: 'We are open 7am-6pm Monday-Friday.',
      sourceExcerpt: 'Hours: 7:00 AM – 6:00 PM, Mon–Fri.',
      confidence: ExtractionConfidence.High,
    })
    expect(result[1].sourceExcerpt).toBeNull()
    expect(result[1].confidence).toBe(ExtractionConfidence.Medium)
  })

  it('skips inquiries missing a question or answer', async () => {
    const messagesCreate = jest.fn().mockResolvedValue(
      makeAnthropicResponse(
        JSON.stringify({
          inquiries: [
            { question: 'Q1', answer: 'A1' },
            { question: '', answer: 'A2' },
            { question: 'Q3', answer: '' },
          ],
        }),
      ),
    )
    const { service } = makeService(messagesCreate)

    const result = await service.extractInquiries('Handbook.')
    expect(result).toHaveLength(1)
    expect(result[0].question).toBe('Q1')
    expect(result[0].confidence).toBe(ExtractionConfidence.Medium)
  })

  it('tolerates prose wrapped around the JSON object', async () => {
    const wrapped = 'Here is the FAQ:\n```json\n' +
      JSON.stringify({
        inquiries: [{ question: 'Q', answer: 'A', confidence: 'low' }],
      }) +
      '\n```'
    const messagesCreate = jest.fn().mockResolvedValue(makeAnthropicResponse(wrapped))
    const { service } = makeService(messagesCreate)

    const result = await service.extractInquiries('Handbook.')
    expect(result).toHaveLength(1)
    expect(result[0].confidence).toBe(ExtractionConfidence.Low)
  })

  it('throws when the response is not valid JSON', async () => {
    const messagesCreate = jest
      .fn()
      .mockResolvedValue(makeAnthropicResponse('not json at all'))
    const { service } = makeService(messagesCreate)

    await expect(service.extractInquiries('Handbook.')).rejects.toThrow(
      InternalServerErrorException,
    )
  })

  it('throws when the payload has no inquiries array', async () => {
    const messagesCreate = jest
      .fn()
      .mockResolvedValue(makeAnthropicResponse(JSON.stringify({ items: [] })))
    const { service } = makeService(messagesCreate)

    await expect(service.extractInquiries('Handbook.')).rejects.toThrow(
      /inquiries array/,
    )
  })

  it('truncates very long handbooks before sending to Claude', async () => {
    const messagesCreate = jest.fn().mockResolvedValue(
      makeAnthropicResponse(JSON.stringify({ inquiries: [] })),
    )
    const { service } = makeService(messagesCreate)

    const longInput = 'x'.repeat(500_000)
    await service.extractInquiries(longInput)

    const call = messagesCreate.mock.calls[0][0]
    const userContent: string = call.messages[0].content
    expect(userContent.length).toBeLessThan(200_000)
  })
})
