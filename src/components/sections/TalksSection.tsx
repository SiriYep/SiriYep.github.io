import { Box, Container, VStack, HStack, Text, Heading, Flex, Link } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import DynamicIcon from '../DynamicIcon'

const typeLabels: Record<string, { icon: string; color: string }> = {
  keynote: { icon: 'FaStar', color: 'warm' },
  invited: { icon: 'FaUserTie', color: 'purple.400' },
  oral: { icon: 'FaMicrophone', color: 'accent' },
  poster: { icon: 'FaImage', color: 'prompt' },
  tutorial: { icon: 'FaChalkboardTeacher', color: 'orange.400' },
  workshop: { icon: 'FaTools', color: 'blue.400' },
  panel: { icon: 'FaUsers', color: 'pink.400' },
  other: { icon: 'FaComments', color: 'textMuted' },
}

const TalksSection: React.FC = () => {
  const { t } = useTranslation()
  const { talks } = useLocalizedData()

  if (!talks || talks.length === 0) return null

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.talks', 'Talks')}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        <VStack spacing={0} align="stretch">
          {talks.map((talk, i) => {
            const meta = typeLabels[talk.type || 'other'] || typeLabels.other
            return (
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
                  <DynamicIcon name={meta.icon} boxSize={3.5} color={meta.color} />
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="medium" color="textPrimary" lineHeight="short">{talk.title}</Text>
                  <HStack spacing={2} mt={1} flexWrap="wrap">
                    <Text fontSize="xs" color="textSecondary">{talk.event}</Text>
                    {talk.location && <Text fontSize="xs" color="textMuted">· {talk.location}</Text>}
                  </HStack>
                  {(talk.slidesUrl || talk.videoUrl) && (
                    <HStack spacing={3} mt={1}>
                      {talk.slidesUrl && (
                        <Link href={talk.slidesUrl} isExternal fontSize="xs" fontFamily="mono" color="accent" _hover={{ color: 'accentStrong', textDecoration: 'underline' }}>
                          slides
                        </Link>
                      )}
                      {talk.videoUrl && (
                        <Link href={talk.videoUrl} isExternal fontSize="xs" fontFamily="mono" color="accent" _hover={{ color: 'accentStrong', textDecoration: 'underline' }}>
                          video
                        </Link>
                      )}
                    </HStack>
                  )}
                </Box>
                <Text fontSize="xs" fontFamily="mono" color="textMuted" whiteSpace="nowrap" flexShrink={0}>{talk.date}</Text>
              </Flex>
            )
          })}
        </VStack>
      </Container>
    </Box>
  )
}

export default TalksSection
