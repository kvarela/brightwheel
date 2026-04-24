import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Box, Button, CloseButton, Dialog, Input, Portal, Text } from '@chakra-ui/react'
import { apiClient } from '../../lib/apiClient'
import { useAuthStore } from '../../store/authStore'
import { BwButton } from '../../components/BwButton'
import { Loader } from '../../components/Loader'
import { SchoolSelect } from './components/SchoolSelect'
import type { SchoolSelection } from './components/SchoolSelect'
import type { RegisterFormData } from './interfaces/RegisterFormData'

export function RegisterModal() {
  const [showPassword, setShowPassword] = useState(false)
  const [schoolSelection, setSchoolSelection] = useState<SchoolSelection | null>(null)
  const [schoolError, setSchoolError] = useState<string | null>(null)
  const { isRegisterOpen, closeRegister, switchToLogin, setToken } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>()

  const handleClose = () => {
    reset()
    setSchoolSelection(null)
    setSchoolError(null)
    closeRegister()
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (!schoolSelection) {
      setSchoolError('Please select or add your school')
      return
    }
    setSchoolError(null)

    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      schoolId: schoolSelection.id,
      newSchoolName: schoolSelection.id === null ? schoolSelection.name : null,
    }

    try {
      const response = await apiClient.post<{ accessToken: string }>(
        '/api/auth/register',
        payload,
      )
      setToken(response.data.accessToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 409) {
        setError('email', { message: 'An account with this email already exists' })
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  }

  return (
    <Dialog.Root
      open={isRegisterOpen}
      onOpenChange={({ open }) => { if (!open) handleClose() }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2px"
            p="8"
            maxW="480px"
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
                Create your account
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pt="0">
              <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Full name */}
                <Box mb="4">
                  <Text fontSize="14px" fontWeight="500" color="#5C5E6A" mb="1">
                    Full name
                  </Text>
                  <Input
                    type="text"
                    placeholder="Jane Smith"
                    border="1px solid"
                    borderColor={errors.fullName ? '#CF193A' : '#EBEFF4'}
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
                    {...register('fullName', { required: 'Full name is required' })}
                  />
                  {errors.fullName && (
                    <Text color="#CF193A" fontSize="12px" mt="1">{errors.fullName.message}</Text>
                  )}
                </Box>

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
                <Box mb="4">
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
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
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

                {/* School */}
                <Box mb="6">
                  <Text fontSize="14px" fontWeight="500" color="#5C5E6A" mb="1">
                    School
                  </Text>
                  <SchoolSelect
                    value={schoolSelection}
                    onChange={(sel) => {
                      setSchoolSelection(sel)
                      if (sel) setSchoolError(null)
                    }}
                    hasError={!!schoolError}
                  />
                  {schoolError && (
                    <Text color="#CF193A" fontSize="12px" mt="1">{schoolError}</Text>
                  )}
                  {schoolSelection && (
                    <Text fontSize="12px" color="#3BBA6E" mt="1">
                      {schoolSelection.id
                        ? `Joining ${schoolSelection.name}`
                        : `Will create "${schoolSelection.name}"`}
                    </Text>
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
                  {isSubmitting ? <Loader size="sm" text="Creating account…" inline /> : 'Create account'}
                </BwButton>

                {/* Switch to login */}
                <Box textAlign="center" mt="5">
                  <Text fontSize="14px" color="#5C5E6A">
                    Already have an account?{' '}
                    <BwButton
                      variant="link"
                      type="button"
                      fontSize="14px"
                      onClick={switchToLogin}
                    >
                      Log in
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
