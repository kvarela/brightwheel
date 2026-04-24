import { Button } from '@chakra-ui/react'
import type { ButtonProps } from '@chakra-ui/react'
import type { BwButtonProps, BwVariant } from './interfaces/BwButtonProps'

const VARIANT_STYLES: Record<BwVariant, Partial<ButtonProps>> = {
  primary: {
    bg: '#5463D6',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    _hover: { bg: '#4453C5' },
    _active: { bg: '#3A47B0' },
    _disabled: { opacity: 0.7, cursor: 'not-allowed' },
  },
  secondary: {
    bg: 'transparent',
    color: '#5463D6',
    border: '1px solid #5463D6',
    borderRadius: '2px',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    _hover: { bg: '#5463D6', color: 'white' },
    _active: { bg: '#4453C5', color: 'white' },
  },
  'outline-light': {
    bg: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '2px',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    _hover: { bg: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.8)' },
  },
  link: {
    bg: 'transparent',
    color: '#5463D6',
    border: 'none',
    fontWeight: '600',
    p: '0',
    h: 'auto',
    minH: 'auto',
    _hover: { textDecoration: 'underline', bg: 'transparent' },
    _active: { bg: 'transparent' },
  },
}

export function BwButton({ variant = 'primary', ...props }: BwButtonProps) {
  return <Button {...(VARIANT_STYLES[variant] as ButtonProps)} {...props} />
}
