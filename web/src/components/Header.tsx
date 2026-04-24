import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BrightwheelLogo } from './BrightwheelLogo'
import { useAuthStore } from '../store/authStore'

const NAV_ITEMS = ['For Schools', 'For Parents', 'Features', 'Pricing']

export function Header() {
  const { openLogin, openRegister } = useAuthStore()

  return (
    <Box
      as="header"
      bg="#1E2549"
      position="sticky"
      top={0}
      zIndex={100}
      borderBottom="1px solid rgba(255,255,255,0.08)"
    >
      <Flex
        maxW="1200px"
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
          <Box
            as="button"
            bg="transparent"
            color="white"
            border="1px solid rgba(255,255,255,0.4)"
            borderRadius="2px"
            px="20px"
            py="10px"
            fontSize="14px"
            fontWeight={600}
            cursor="pointer"
            transition="all 0.3s ease-in-out"
            _hover={{ bg: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.8)' }}
            onClick={openLogin}
          >
            Login
          </Box>
          <Box
            as="button"
            bg="#5463D6"
            color="white"
            border="none"
            borderRadius="2px"
            px="20px"
            py="10px"
            fontSize="14px"
            fontWeight={600}
            cursor="pointer"
            display={{ base: 'none', md: 'block' }}
            transition="all 0.3s ease-in-out"
            _hover={{ bg: '#4352c5' }}
            onClick={openRegister}
          >
            Get started
          </Box>
        </HStack>
      </Flex>
    </Box>
  )
}
