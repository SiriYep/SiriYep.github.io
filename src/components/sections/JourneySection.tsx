import { Box, Container, VStack, HStack, Text, Heading, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { withBase } from '@/utils/asset'
import type { JourneyPhase } from '@/types'
import InstitutionLogo from '../InstitutionLogo'
import SectionMoreLink from '../SectionMoreLink'

const HOME_EXPERIENCE_LIMIT = 3

/** Parse **bold** markers in text */
const renderBoldText = (text: string, color: string, boldColor: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text as="span" key={i} fontWeight="semibold" color={boldColor}>{part.slice(2, -2)}</Text>
    }
    return <Text as="span" key={i} color={color}>{part}</Text>
  })
}

const JourneySection: React.FC = () => {
  const { t } = useTranslation()
  const { about, institutionLogos } = useLocalizedData()

  if (!about.journeyPhases || about.journeyPhases.length === 0) return null

  const hasExplicitGroups = about.journeyPhases.some((phase) => phase.kind)
  const groups = hasExplicitGroups
    ? [
        {
          title: t('about.educationJourney', 'Education'),
          phases: about.journeyPhases
            .filter((phase) => phase.kind === 'education')
            .reverse(),
        },
        {
          title: t('about.researchExperience', 'Research & Internships'),
          phases: about.journeyPhases
            .filter((phase) => phase.kind !== 'education')
            .slice(-HOME_EXPERIENCE_LIMIT)
            .reverse(),
        },
      ].filter((group) => group.phases.length > 0)
    : [{ title: t('about.myJourney'), phases: about.journeyPhases }]

  const renderTimeline = (phases: JourneyPhase[]) => (
    <Box w="full" position="relative">
      <Box position="absolute" left="5px" top="15px" bottom="15px" w="1px" bg="var(--border-color)" />

      <VStack spacing={3} align="stretch">
        {phases.map((phase) => {
          const isOngoing = /present|至今/i.test(phase.period)
          const institutionLogo = institutionLogos[phase.org]
          return (
          <Flex key={`${phase.period}-${phase.title}`} gap={[3, 4]} align="start" position="relative">
            <Box flexShrink={0} mt="15px">
              <Box
                w="11px" h="11px" borderRadius="full" border="2px solid"
                borderColor="accent"
                bg={isOngoing ? 'accent' : 'var(--bg-color)'}
                boxShadow={isOngoing ? 'var(--glow-accent)' : undefined}
              />
            </Box>
            <Box
              flex={1}
              minW={0}
              bg="var(--card-bg)"
              border="1px solid"
              borderColor="var(--border-color)"
              borderRadius="12px"
              boxShadow="var(--shadow-sm)"
              px={[3.5, 4]}
              py={[3, 3.5]}
              transition="border-color .2s ease, box-shadow .2s ease"
              _hover={{ borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-card)' }}
            >
              <Flex align="center" gap={2.5} mb={1}>
                {institutionLogo && (
                  <InstitutionLogo src={withBase(institutionLogo)} label={phase.org} size="sm" />
                )}
                <Box minW={0} flex={1}>
                  <HStack spacing={2} mb={1} flexWrap="wrap">
                    <Text fontSize="xs" fontFamily="mono" color="textMuted" letterSpacing="wide">
                      {phase.period}
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="textMuted">·</Text>
                    <Text fontSize="xs" fontFamily="mono" color="textMuted">{phase.org}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="textPrimary">{phase.title}</Text>
                </Box>
              </Flex>
              <Text fontSize="sm" lineHeight="tall" mb={phase.tags ? 2.5 : 0}>
                {renderBoldText(phase.description, 'textSecondary', 'textPrimary')}
              </Text>
              {phase.tags && (
                <HStack spacing={1.5} flexWrap="wrap">
                  {phase.tags.map((tag) => (
                    <Text
                      key={tag}
                      fontSize="2xs"
                      fontFamily="mono"
                      letterSpacing="wide"
                      color="textSecondary"
                      px={2}
                      py={0.5}
                      bg="var(--hover-color)"
                      border="1px solid"
                      borderColor="var(--border-color)"
                      borderRadius="6px"
                    >
                      {tag}
                    </Text>
                  ))}
                </HStack>
              )}
            </Box>
          </Flex>
          )
        })}
      </VStack>
    </Box>
  )

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <VStack spacing={10} align="stretch">
          {groups.map((group, index) => (
            <Box key={group.title} w="full">
              <Flex align="center" gap={3} w="full" mb={5}>
                <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
                <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{group.title}</Heading>
                <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
              </Flex>
              {renderTimeline(group.phases)}
              {index === groups.length - 1 && (
                <SectionMoreLink to="/experience">{t('about.viewAllExperience')}</SectionMoreLink>
              )}
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  )
}

export default JourneySection
