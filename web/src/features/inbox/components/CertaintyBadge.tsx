import { Box } from '@chakra-ui/react'

interface CertaintyBadgeProps {
  score: number | null
}

function tone(score: number): { bg: string; color: string; label: string } {
  if (score >= 0.8) return { bg: '#E9F8EF', color: '#3BBA6E', label: 'High' }
  if (score >= 0.6) return { bg: '#FFF9E5', color: '#896507', label: 'Medium' }
  return { bg: '#FFF6F5', color: '#CF193A', label: 'Low' }
}

export function CertaintyBadge({ score }: CertaintyBadgeProps) {
  if (score === null) return null
  const { bg, color, label } = tone(score)
  return (
    <Box
      bg={bg}
      color={color}
      fontSize="11px"
      fontWeight={600}
      px="8px"
      py="3px"
      borderRadius="12px"
      display="inline-flex"
      alignItems="center"
      gap="4px"
    >
      {label} · {Math.round(score * 100)}%
    </Box>
  )
}
