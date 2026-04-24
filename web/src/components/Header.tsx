import { Flex, HStack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BrightwheelLogo } from './BrightwheelLogo'
import { BwButton } from './BwButton'
import { useAuthStore } from '../store/authStore'

const NAV_ITEMS = ['For Schools', 'For Parents', 'Features', 'Pricing']

export function Header() {
  const { openLogin, openRegister } = useAuthStore()

  return (
    <Flex
      as="header"
      bg="#1E2549"
      position="sticky"
      top={0}
      zIndex={100}
      borderBottom="1px solid rgba(255,255,255,0.08)"
    >
      <Flex
        maxW="1200px"
        w="full"
        mx="auto"
        px={{ base: '16px', md: '32px' }}
        py="16px"
        align="center"
        justify="space-between"
      >
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <BrightwheelLogo variant="light" />
        </RouterLink>

        <HStack gap={8} display={{ base: 'none', lg: 'flex' }}>
          {NAV_ITEMS.map((item) => (
            <Text
              key={item}
              color="rgba(255,255,255,0.8)"
              fontSize="14px"
              fontWeight={500}
              cursor="pointer"
              transition="color 0.2s ease"
              _hover={{ color: '#29B9BB' }}
            >
              {item}
            </Text>
          ))}
        </HStack>

        <HStack gap={3}>
          <BwButton
            variant="outline-light"
            px="20px"
            py="10px"
            fontSize="14px"
            onClick={openLogin}
          >
            Login
          </BwButton>
          <BwButton
            variant="primary"
            px="20px"
            py="10px"
            fontSize="14px"
            display={{ base: 'none', md: 'inline-flex' }}
            onClick={openRegister}
          >
            Get started
          </BwButton>
        </HStack>
      </Flex>
    </Flex>
  )
}
