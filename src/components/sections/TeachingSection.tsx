import { Box, Container, VStack, HStack, Text, Heading, Flex, Link } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import DynamicIcon from '../DynamicIcon'

const roleIcons: Record<string, string> = {
  instructor: 'FaChalkboardTeacher',
  ta: 'FaUserGraduate',
  'guest-lecturer': 'FaMicrophone',
  'co-instructor': 'FaUsers',
  other: 'FaBook',
}

const TeachingSection: React.FC = () => {
  const { t } = useTranslation()
  const { teaching } = useLocalizedData()

  if (!teaching || teaching.length === 0) return null

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.teaching', 'Teaching')}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        <VStack spacing={0} align="stretch">
          {teaching.map((entry, i) => (
            <Flex
              key={i}
              align="start"
              gap={3}
              py={3}
              borderBottom="1px solid"
              borderColor="var(--border-color)"
              _last={{ borderBottomWidth: 0 }}
            >
              <Box mt="3px" flexShrink={0}>
                <DynamicIcon name={roleIcons[entry.role] || roleIcons.other} boxSize={3.5} color="accent" />
              </Box>
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="medium" color="textPrimary" lineHeight="short">
                  {entry.link ? (
                    <Link href={entry.link} isExternal color="textPrimary" _hover={{ color: 'accent' }}>{entry.course}</Link>
                  ) : entry.course}
                </Text>
                <HStack spacing={2} mt={1} flexWrap="wrap">
                  <Text fontSize="xs" color="textSecondary">{entry.institution}</Text>
                  <Text fontSize="xs" fontFamily="mono" color="textMuted">· {entry.role}</Text>
                </HStack>
                {entry.description && <Text fontSize="xs" lineHeight="tall" color="textSecondary" mt={1}>{entry.description}</Text>}
              </Box>
              <Text fontSize="xs" fontFamily="mono" color="textMuted" whiteSpace="nowrap" flexShrink={0}>{entry.semester}</Text>
            </Flex>
          ))}
        </VStack>
      </Container>
    </Box>
  )
}

export default TeachingSection
