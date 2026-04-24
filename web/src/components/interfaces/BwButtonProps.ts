import type { ButtonProps } from '@chakra-ui/react'

export type BwVariant = 'primary' | 'secondary' | 'outline-light' | 'link'

export interface BwButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: BwVariant
}
