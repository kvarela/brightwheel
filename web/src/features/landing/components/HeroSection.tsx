import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { useAuthStore } from '../../../store/authStore'
import { SchoolSelectionModal } from '../../school/components/SchoolSelectionModal'
import heroImg from '../../../assets/hero.avif'

const ROLES = [
  { id: 'staff', label: "I'm a staff member" },
  { id: 'parent', label: "I'm a parent or guardian" },
]

export function HeroSection() {
  const { openLogin } = useAuthStore()
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleRoleClick = (roleId: string) => {
    if (roleId === 'staff') {
      openLogin()
    } else if (roleId === 'parent') {
      setIsSchoolModalOpen(true)
    }
  }

  return (
    <Box
      as="section"
      bg="white"
      pt={{ base: '64px', md: '96px' }}
      pb={{ base: '64px', md: '96px' }}
      position="relative"
      overflow="hidden"
    >
      {/* Hero background image — oversized vertically so parallax never reveals a gap */}
      <img
        ref={imgRef}
        src={heroImg}
        aria-hidden
        style={{
          position: 'absolute',
          top: '-15%',
          left: 0,
          width: '100%',
          height: '130%',
          objectFit: 'cover',
          objectPosition: 'center 30%',
          opacity: 0.18,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
      {/* Gradient vignette to keep center text crisp */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="radial(ellipse 55% 60% at 50% 45%, white 25%, transparent 75%)"
        pointerEvents="none"
      />
      <VStack gap={0} maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }} position="relative" zIndex={1}>
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
          <Flex direction={{ base: 'column', sm: 'row' }} gap={3} justify="center">
            {ROLES.map((role) => (
              <Box
                key={role.id}
                as="button"
                onClick={() => handleRoleClick(role.id)}
                bg="white"
                color="#18181D"
                border="1px solid #EBEFF4"
                borderRadius="2px"
                px="16px"
                py="12px"
                fontSize="14px"
                fontWeight={600}
                cursor="pointer"
                flex={1}
                transition="all 0.2s ease"
                _hover={{ borderColor: '#5463D6', color: '#5463D6' }}
                boxShadow="0 1px 3px rgba(0,0,0,0.06)"
              >
                {role.label}
              </Box>
            ))}
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
                      Hi! Our AI assistant is here to help. What would you like to know about our
                      program?
                    </Text>
                  </Box>
                  <Box bg="#F7F9FB" borderRadius="2px" p={3} maxW="240px" ml="auto">
                    <Text fontSize="13px" color="#18181D" lineHeight={1.5}>
                      What are your drop-off hours?
                    </Text>
                  </Box>
                  <Box bg="#5463D6" borderRadius="2px" p={3} mt={2} maxW="300px">
                    <Text fontSize="13px" color="white" lineHeight={1.5}>
                      Drop-off is from 7:30 AM to 9:00 AM Monday–Friday. Late arrivals should call
                      ahead!
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
