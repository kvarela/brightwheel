import { useState } from 'react'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { BwButton } from '../../../components/BwButton'
import { useAuthStore } from '../../../store/authStore'

const ROLES = [
  { id: 'admin', label: "I'm an admin or director" },
  { id: 'staff', label: "I'm a staff member" },
  { id: 'parent', label: "I'm a parent or guardian" },
]

export function FooterCTASection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const { openRegister } = useAuthStore()

  return (
    <Box as="section" bg="#5463D6" py={{ base: '64px', md: '96px' }}>
      <Box maxW="800px" mx="auto" px={{ base: '16px', md: '32px' }} textAlign="center">
        <VStack gap={6}>
          <Text
            as="h2"
            fontSize={{ base: '30px', md: '44px' }}
            fontWeight={600}
            color="white"
            lineHeight={1.2}
            letterSpacing="-0.8px"
            fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
          >
            Start your AI front desk today
          </Text>
          <Text
            fontSize={{ base: '16px', md: '18px' }}
            color="rgba(255,255,255,0.8)"
            maxW="480px"
            lineHeight={1.6}
          >
            Join thousands of childcare programs answering parent questions 24/7. No credit card required.
          </Text>

          <Box w="full" maxW="600px" mt={2}>
            <Text fontSize="14px" color="rgba(255,255,255,0.7)" mb={3} fontWeight={500}>
              Choose your role to get started
            </Text>
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              gap={3}
              justify="center"
            >
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id
                return (
                  <Box
                    key={role.id}
                    as="button"
                    onClick={() => setSelectedRole(role.id)}
                    bg={isSelected ? 'white' : 'rgba(255,255,255,0.12)'}
                    color={isSelected ? '#5463D6' : 'white'}
                    border={isSelected ? '1px solid white' : '1px solid rgba(255,255,255,0.3)'}
                    borderRadius="2px"
                    px="16px"
                    py="12px"
                    fontSize="14px"
                    fontWeight={600}
                    cursor="pointer"
                    flex={1}
                    transition="all 0.2s ease"
                    _hover={{
                      bg: isSelected ? 'white' : 'rgba(255,255,255,0.2)',
                      borderColor: 'white',
                    }}
                  >
                    {role.label}
                  </Box>
                )
              })}
            </Flex>
          </Box>

          <Flex direction="column" align="center" gap={4} mt={2}>
            <BwButton
              variant="primary"
              bg="white"
              color="#5463D6"
              px="32px"
              py="15px"
              fontSize="16px"
              fontWeight={700}
              _hover={{ bg: 'rgba(255,255,255,0.9)', transform: 'translateY(-1px)' }}
              boxShadow="0 4px 16px rgba(0,0,0,0.2)"
              onClick={openRegister}
            >
              Get started free
            </BwButton>
            <Text fontSize="13px" color="rgba(255,255,255,0.6)">
              Free 30-day trial · No credit card required · Cancel anytime
            </Text>
          </Flex>
        </VStack>
      </Box>
    </Box>
  )
}
