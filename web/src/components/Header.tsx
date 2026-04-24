import { chakra, Flex, HStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BrightwheelLogo } from './BrightwheelLogo'
import { BwButton } from './BwButton'
import { NotificationBadge } from './NotificationBadge'
import { useAuthStore } from '../store/authStore'

const NAV_ITEMS = [
  { label: 'For Schools', href: 'https://mybrightwheel.com/childcare-preschool-director' },
  { label: 'For Parents', href: 'https://mybrightwheel.com/parents' },
  { label: 'Features', href: 'https://mybrightwheel.com/features' },
  { label: 'Pricing', href: 'https://mybrightwheel.com/pricing' },
]

export function Header() {
  const { isAuthenticated, openLogin, openRegister, clearToken } = useAuthStore()

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
          <BrightwheelLogo />
        </RouterLink>

        <HStack gap={8} display={{ base: 'none', lg: 'flex' }}>
          {NAV_ITEMS.map((item) => (
            <chakra.a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              color="rgba(255,255,255,0.8)"
              fontSize="14px"
              fontWeight={500}
              cursor="pointer"
              transition="color 0.2s ease"
              textDecoration="none"
              _hover={{ color: '#29B9BB' }}
            >
              {item.label}
            </chakra.a>
          ))}
        </HStack>

        {isAuthenticated ? (
          <HStack gap={3}>
            <NotificationBadge />
            <RouterLink to="/dashboard" style={{ textDecoration: 'none' }}>
              <BwButton variant="outline-light" px="20px" py="10px" fontSize="14px">
                Dashboard
              </BwButton>
            </RouterLink>
            <BwButton
              variant="primary"
              px="20px"
              py="10px"
              fontSize="14px"
              display={{ base: 'none', md: 'inline-flex' }}
              onClick={clearToken}
            >
              Log out
            </BwButton>
          </HStack>
        ) : (
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
        )}
      </Flex>
    </Flex>
  )
}
