import { useRef, useState, useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { LiveChatsSection } from './components/LiveChatsSection'
import { HandbookUploadsSection } from './components/HandbookUploadsSection'
import { KnowledgeBaseSection } from './components/KnowledgeBaseSection'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useInboxStore } from '../../store/inboxStore'
import { useAuthStore } from '../../store/authStore'
import { BrightwheelLogo } from '../../components/BrightwheelLogo'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        fill={active ? 'white' : 'rgba(255,255,255,0.6)'}
      />
    </svg>
  )
}

export function DashboardPage() {
  const { data: currentUser } = useCurrentUser()
  const unreadCount = useInboxStore((s) => s.unreadCount)
  const hasNotifications = unreadCount > 0
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  const initials = currentUser ? getInitials(currentUser.fullName) : ''

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    if (menuOpen || bellOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen, bellOpen])

  const { clearToken } = useAuthStore()

  function handleLogout() {
    clearToken()
    window.location.href = '/'
  }

  return (
    <Box
      bg="#F7F9FB"
      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
    >
      <Box
        as="header"
        bg="#1E2549"
        px={{ base: '16px', md: '40px' }}
        height="60px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left: logo + school name */}
        <Box display="flex" alignItems="center" gap="12px">
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <BrightwheelLogo />
          </RouterLink>
          {currentUser?.schoolName && (
            <>
              <Box flexShrink={0} width="1px" height="18px" bg="rgba(255,255,255,0.15)" />
              <Box
                px="10px"
                py="3px"
                bg="rgba(255,255,255,0.08)"
                border="1px solid rgba(255,255,255,0.15)"
                borderRadius="2px"
              >
                <Text
                  fontSize="13px"
                  fontWeight={500}
                  color="rgba(255,255,255,0.75)"
                  fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                  whiteSpace="nowrap"
                >
                  {currentUser.schoolName}
                </Text>
              </Box>
            </>
          )}
        </Box>

        {/* Right: bell + avatar */}
        <Box display="flex" alignItems="center" gap="8px">
          {/* Bell */}
          <Box position="relative" ref={bellRef}>
            <Box
              as="button"
              width="36px"
              height="36px"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              bg="transparent"
              border="none"
              outline="none"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              transition="background 0.2s"
              onClick={() => setBellOpen((v) => !v)}
            >
              <BellIcon active={hasNotifications} />
              {hasNotifications && (
                <Box
                  position="absolute"
                  top="7px"
                  right="7px"
                  width="8px"
                  height="8px"
                  borderRadius="50%"
                  bg="#CF193A"
                  border="2px solid white"
                />
              )}
            </Box>

            {bellOpen && (
              <Box
                position="absolute"
                top="calc(100% + 8px)"
                right="0"
                bg="white"
                borderRadius="2px"
                border="1px solid #EBEFF4"
                boxShadow="0 4px 16px rgba(0,0,0,0.10)"
                minWidth="220px"
                zIndex={100}
                overflow="hidden"
              >
                <Box px="16px" py="10px" borderBottom="1px solid #EBEFF4">
                  <Text
                    fontSize="13px"
                    fontWeight={600}
                    color="#18181D"
                    fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Notifications
                  </Text>
                </Box>
                {!hasNotifications && (
                  <Box px="16px" py="16px">
                    <Text
                      fontSize="14px"
                      color="#737685"
                      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                    >
                      You have no notifications.
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Avatar + dropdown */}
          <Box position="relative" ref={menuRef}>
            <Box
              as="button"
              width="36px"
              height="36px"
              borderRadius="50%"
              bg="#29B9BB"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              flexShrink={0}
              border="none"
              outline="none"
              _hover={{ bg: '#22A5A7' }}
              transition="background 0.2s"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: '"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {initials}
              </span>
            </Box>

            {menuOpen && (
              <Box
                position="absolute"
                top="calc(100% + 8px)"
                right="0"
                bg="white"
                borderRadius="2px"
                border="1px solid #EBEFF4"
                boxShadow="0 4px 16px rgba(0,0,0,0.10)"
                minWidth="180px"
                zIndex={100}
                overflow="hidden"
              >
                {currentUser && (
                  <Box px="16px" py="12px" borderBottom="1px solid #EBEFF4">
                    <Text
                      fontSize="14px"
                      fontWeight={600}
                      color="#18181D"
                      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                    >
                      {currentUser.fullName}
                    </Text>
                    <Text
                      fontSize="12px"
                      color="#737685"
                      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                      mt="2px"
                    >
                      {currentUser.email}
                    </Text>
                  </Box>
                )}
                <Box
                  as="button"
                  width="100%"
                  textAlign="left"
                  px="16px"
                  py="12px"
                  bg="transparent"
                  border="none"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  gap="8px"
                  _hover={{ bg: '#F7F9FB' }}
                  transition="background 0.15s"
                  onClick={handleLogout}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                      fill="#5C5E6A"
                    />
                  </svg>
                  <Text
                    fontSize="14px"
                    color="#18181D"
                    fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                  >
                    Log out
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        maxWidth="960px"
        mx="auto"
        px={{ base: '16px', md: '40px' }}
        py="32px"
        display="flex"
        flexDirection="column"
        gap="24px"
      >
        <LiveChatsSection />
        <HandbookUploadsSection />
        <KnowledgeBaseSection />
      </Box>
    </Box>
  )
}
