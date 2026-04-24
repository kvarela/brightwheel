import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Box, Button, CloseButton, Dialog, Input, Portal, Text } from '@chakra-ui/react'
import { apiClient } from '../../lib/apiClient'
import { useAuthStore } from '../../store/authStore'
import { BwButton } from '../../components/BwButton'
import { Loader } from '../../components/Loader'
import type { LoginFormData } from './interfaces/LoginFormData'

export function LoginModal() {
  const [showPassword, setShowPassword] = useState(false)
  const { isLoginOpen, closeLogin, switchToRegister, setToken } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()

  const handleClose = () => {
    reset()
    closeLogin()
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/api/auth/login', data)
      setToken(response.data.accessToken)
      navigate('/dashboard')
    } catch {
      setError('root', { message: 'Invalid email or password. Please try again.' })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault()
      void handleSubmit(onSubmit)()
    }
  }

  return (
    <Dialog.Root
      open={isLoginOpen}
      onOpenChange={({ open }) => { if (!open) handleClose() }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2px"
            p="8"
            maxW="440px"
            w="full"
            boxShadow="0 8px 32px rgba(0,0,0,0.12)"
          >
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top="4"
                right="4"
                color="#5C5E6A"
                _hover={{ color: '#18181D' }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Header pb="6">
              <Dialog.Title
                fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                fontSize="22px"
                fontWeight="600"
                color="#1E2549"
              >
                Log in to Brightwheel
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pt="0">
              <Box as="form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
                {/* Email */}
                <Box mb="4">
                  <Text fontSize="14px" fontWeight="500" color="#5C5E6A" mb="1">
                    Email
                  </Text>
                  <Input
                    type="email"
                    placeholder="you@school.com"
                    border="1px solid"
                    borderColor={errors.email ? '#CF193A' : '#EBEFF4'}
                    borderRadius="2px"
                    px="4"
                    py="3"
                    fontSize="16px"
                    color="#18181D"
                    bg="white"
                    _placeholder={{ color: '#737685' }}
                    _focus={{
                      borderColor: '#5463D6',
                      boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
                      outline: 'none',
                    }}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                    })}
                  />
                  {errors.email && (
                    <Text color="#CF193A" fontSize="12px" mt="1">{errors.email.message}</Text>
                  )}
                </Box>

                {/* Password */}
                <Box mb="6">
                  <Text fontSize="14px" fontWeight="500" color="#5C5E6A" mb="1">
                    Password
                  </Text>
                  <Box position="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      border="1px solid"
                      borderColor={errors.password ? '#CF193A' : '#EBEFF4'}
                      borderRadius="2px"
                      px="4"
                      py="3"
                      pr="16"
                      fontSize="16px"
                      color="#18181D"
                      bg="white"
                      _placeholder={{ color: '#737685' }}
                      _focus={{
                        borderColor: '#5463D6',
                        boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
                        outline: 'none',
                      }}
                      {...register('password', { required: 'Password is required' })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      color="#5C5E6A"
                      fontSize="12px"
                      fontWeight="600"
                      px="2"
                      h="auto"
                      minH="0"
                      py="1"
                      _hover={{ color: '#5463D6', bg: 'transparent' }}
                      onClick={() => setShowPassword((p) => !p)}
                      tabIndex={-1}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </Box>
                  {errors.password && (
                    <Text color="#CF193A" fontSize="12px" mt="1">{errors.password.message}</Text>
                  )}
                </Box>

                {/* Root error */}
                {errors.root && (
                  <Box
                    bg="#FFF6F5"
                    border="1px solid #CF193A"
                    borderRadius="2px"
                    p="3"
                    mb="4"
                  >
                    <Text color="#CF193A" fontSize="14px">{errors.root.message}</Text>
                  </Box>
                )}

                {/* Submit */}
                <BwButton
                  type="submit"
                  w="full"
                  h="auto"
                  py="4"
                  fontSize="16px"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader size="sm" text="Logging in…" inline /> : 'Log in'}
                </BwButton>

                {/* Switch to register */}
                <Box textAlign="center" mt="5">
                  <Text fontSize="14px" color="#5C5E6A">
                    Don&apos;t have an account?{' '}
                    <BwButton
                      variant="link"
                      type="button"
                      fontSize="14px"
                      onClick={switchToRegister}
                    >
                      Sign up
                    </BwButton>
                  </Text>
                </Box>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
