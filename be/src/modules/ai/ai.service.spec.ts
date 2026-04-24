import { ConfigService } from '@nestjs/config'
import { AiService } from './ai.service'

describe('AiService', () => {
  describe('without API keys configured', () => {
    let service: AiService

    beforeEach(() => {
      const config = {
        get: () => undefined,
      } as unknown as ConfigService
      service = new AiService(config)
    })

    it('returns null embedding when no OpenAI key is set', async () => {
      const embedding = await service.generateEmbedding('hello')
      expect(embedding).toBeNull()
    })

    it('falls back to the top KB answer when similarity is high enough', async () => {
      const result = await service.generateResponse('Acme', 'What are your hours?', [
        {
          question: 'What are your hours?',
          answer: 'We are open 7am to 6pm.',
          similarity: 0.82,
        },
      ])
      expect(result.answer).toBe('We are open 7am to 6pm.')
      expect(result.modelConfidence).toBeGreaterThan(0.6)
    })

    it('returns a low-confidence escalation response when no match is found', async () => {
      const result = await service.generateResponse('Acme', 'anything', [])
      expect(result.modelConfidence).toBeLessThan(0.5)
      expect(result.answer.toLowerCase()).toContain('staff')
    })

    it('returns a low-confidence response when top similarity is weak', async () => {
      const result = await service.generateResponse('Acme', 'foo', [
        { question: 'bar', answer: 'baz', similarity: 0.3 },
      ])
      expect(result.modelConfidence).toBeLessThan(0.5)
    })
  })
})
