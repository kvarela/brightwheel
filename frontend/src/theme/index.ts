import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        blurple: { value: '#5463D6' },
        caribbean: { value: '#29B9BB' },
        charcoal: { value: '#18181D' },
        graphite: { value: '#5C5E6A' },
        minersCoal: { value: '#737685' },
        cloud: { value: '#EBEFF4' },
        air: { value: '#F7F9FB' },
        joker: { value: '#3BBA6E' },
        lemon: { value: '#FECC38' },
        strawberry: { value: '#CF193A' },
        blackout: { value: '#1E2549' },
      },
      fonts: {
        heading: {
          value: '"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif',
        },
        body: {
          value: '"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif',
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
