import { useState } from 'react'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { SchoolSelectionModal } from '../../school/components/SchoolSelectionModal'

const ROLES = [
  { id: 'admin', label: "I'm an admin or director" },
  { id: 'staff', label: "I'm a staff member" },
  { id: 'parent', label: "I'm a parent or guardian" },
]

export function HeroSection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false)

  const handleRoleClick = (roleId: string) => {
    setSelectedRole(roleId)
    if (roleId === 'parent') {
      setIsSchoolModalOpen(true)
    }
  }

  return (
    <Box as="section" bg="white" pt={{ base: '64px', md: '96px' }} pb={{ base: '64px', md: '96px' }}>
      <VStack gap={0} maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }}>
        <VStack gap={6} maxW="760px" mx="auto" textAlign="center">
          <Box
            bg="#EEF0FC"
            color="#5463D6"
            px="14px"
            py="6px"
            borderRadius="100px"
            fontSize="13px"
            fontWeight={600}
            letterSpacing="0.02em"
          >
            AI Front Desk for Childcare Centers
          </Box>

          <Text
            as="h1"
            fontSize={{ base: '40px', md: '64px', lg: '70px' }}
            fontWeight={600}
            color="#1E2549"
            lineHeight={1.1}
            letterSpacing="-1.5px"
            fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
          >
            More time with families.{' '}
            <Box as="span" color="#5463D6">
              Less time answering calls.
            </Box>
          </Text>

          <Text
            fontSize={{ base: '16px', md: '20px' }}
            color="#5C5E6A"
            lineHeight={1.6}
            maxW="600px"
          >
            The AI-powered front desk built for childcare centers — answering parent questions
            around the clock and escalating what needs a human touch.
          </Text>
        </VStack>

        <Box mt={10} w="full" maxW="600px" mx="auto">
          <Text fontSize="14px" color="#737685" mb={3} textAlign="center" fontWeight={500}>
            Get started — choose your role
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
                  onClick={() => handleRoleClick(role.id)}
                  bg={isSelected ? '#5463D6' : 'white'}
                  color={isSelected ? 'white' : '#18181D'}
                  border={isSelected ? '1px solid #5463D6' : '1px solid #EBEFF4'}
                  borderRadius="2px"
                  px="16px"
                  py="12px"
                  fontSize="14px"
                  fontWeight={600}
                  cursor="pointer"
                  flex={1}
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: '#5463D6',
                    color: isSelected ? 'white' : '#5463D6',
                  }}
                  boxShadow={isSelected ? '0 2px 8px rgba(84,99,214,0.3)' : '0 1px 3px rgba(0,0,0,0.06)'}
                >
                  {role.label}
                </Box>
              )
            })}
          </Flex>

          <Flex direction="column" align="center" gap={4} mt={6}>
            <RouterLink to="/login" style={{ textDecoration: 'none', width: '100%', maxWidth: '280px' }}>
              <Box
                as="button"
                w="full"
                bg="#5463D6"
                color="white"
                border="none"
                borderRadius="2px"
                px="24px"
                py="15px"
                fontSize="16px"
                fontWeight={600}
                cursor="pointer"
                transition="all 0.3s ease-in-out"
                _hover={{ bg: '#4352c5' }}
                boxShadow="0 4px 14px rgba(84,99,214,0.35)"
              >
                Get started free
              </Box>
            </RouterLink>
            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
              <Text
                fontSize="14px"
                color="#5463D6"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                Already using brightwheel? Log in →
              </Text>
            </RouterLink>
          </Flex>
        </Box>

        <Box
          mt={16}
          w="full"
          maxW="900px"
          mx="auto"
          bg="linear-gradient(135deg, #EEF0FC 0%, #E8F5F5 100%)"
          borderRadius="8px"
          overflow="hidden"
          boxShadow="0 20px 60px rgba(30,37,73,0.12)"
          position="relative"
          h={{ base: '240px', md: '360px' }}
        >
          <Flex h="full" align="center" justify="center" direction="column" gap={4} p={8}>
            <Box
              bg="white"
              borderRadius="8px"
              p={4}
              boxShadow="0 4px 16px rgba(0,0,0,0.08)"
              maxW="420px"
              w="full"
            >
              <Flex gap={3} align="flex-end">
                <Box flex={1}>
                  <Box bg="#5463D6" borderRadius="2px" p={3} mb={2} maxW="280px">
                    <Text fontSize="13px" color="white" lineHeight={1.5}>
                      Hi! Our AI assistant is here to help. What would you like to know about our program?
                    </Text>
                  </Box>
                  <Box bg="#F7F9FB" borderRadius="2px" p={3} maxW="240px" ml="auto">
                    <Text fontSize="13px" color="#18181D" lineHeight={1.5}>
                      What are your drop-off hours?
                    </Text>
                  </Box>
                  <Box bg="#5463D6" borderRadius="2px" p={3} mt={2} maxW="300px">
                    <Text fontSize="13px" color="white" lineHeight={1.5}>
                      Drop-off is from 7:30 AM to 9:00 AM Monday–Friday. Late arrivals should call ahead!
                    </Text>
                  </Box>
                </Box>
              </Flex>
            </Box>
            <Box
              bg="white"
              borderRadius="100px"
              px={4}
              py={2}
              boxShadow="0 2px 8px rgba(0,0,0,0.08)"
            >
              <Text fontSize="12px" color="#29B9BB" fontWeight={600}>
                ✓ Answered automatically · 1.2s response
              </Text>
            </Box>
          </Flex>
        </Box>
      </VStack>
      <SchoolSelectionModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
      />
    </Box>
  )
}
