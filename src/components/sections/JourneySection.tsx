import { Box, Container, VStack, HStack, Text, Heading, Flex, Link, useColorModeValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import type { JourneyPhase } from '@/types'

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
  const { about } = useLocalizedData()
  const textColor = useColorModeValue('gray.500', 'gray.400')
  const boldColor = useColorModeValue('gray.700', 'gray.200')
  const headingColor = useColorModeValue('gray.800', 'gray.100')
  const lineColor = useColorModeValue('gray.200', 'gray.700')
  const dotBorder = useColorModeValue('gray.300', 'gray.600')
  const dotBg = useColorModeValue('white', 'gray.800')
  const tagBg = useColorModeValue('gray.100', 'gray.800')
  const dividerTextColor = useColorModeValue('gray.400', 'gray.600')
  const orgTextColor = useColorModeValue('gray.400', 'gray.500')

  if (!about.journeyPhases || about.journeyPhases.length === 0) return null

  const hasExplicitGroups = about.journeyPhases.some((phase) => phase.kind)
  const groups = hasExplicitGroups
    ? [
        {
          title: t('about.educationJourney', 'Education'),
          phases: about.journeyPhases.filter((phase) => phase.kind === 'education'),
        },
        {
          title: t('about.researchExperience', 'Research & Internships'),
          phases: about.journeyPhases.filter((phase) => phase.kind !== 'education'),
        },
      ].filter((group) => group.phases.length > 0)
    : [{ title: t('about.myJourney'), phases: about.journeyPhases }]

  const renderTimeline = (phases: JourneyPhase[], showViewAll: boolean) => (
    <Box w="full" position="relative">
      <Box position="absolute" left={["7px", "7px", "7px"]} top="12px" bottom="12px" w="1px" bg={lineColor} />

      <VStack spacing={0} align="stretch">
        {phases.map((phase) => {
          const isOngoing = /present|至今/i.test(phase.period)
          return (
          <Flex key={`${phase.period}-${phase.title}`} gap={[3, 4]} align="start" py={3} position="relative">
            <Box flexShrink={0} mt="6px">
              <Box
                w="14px" h="14px" borderRadius="full" border="2px solid"
                borderColor={isOngoing ? 'cyan.400' : dotBorder}
                bg={isOngoing ? 'cyan.400' : dotBg}
              />
            </Box>
            <Box flex={1} pb={2}>
              <HStack spacing={2} mb={1} flexWrap="wrap">
                <Text fontSize="2xs" fontFamily="mono" color="cyan.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                  {phase.period}
                </Text>
                <Text fontSize="2xs" color={dividerTextColor}>/</Text>
                <Text fontSize="2xs" fontFamily="mono" color={orgTextColor}>{phase.org}</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color={headingColor} mb={1}>{phase.title}</Text>
              <Text fontSize="xs" lineHeight="tall" mb={2}>
                {renderBoldText(phase.description, textColor, boldColor)}
              </Text>
              {phase.tags && (
                <HStack spacing={1.5} flexWrap="wrap">
                  {phase.tags.map((tag) => (
                    <Text key={tag} fontSize="2xs" fontFamily="mono" color={textColor} px={1.5} py={0.5} bg={tagBg} borderRadius="sm">
                      {tag}
                    </Text>
                  ))}
                </HStack>
              )}
            </Box>
          </Flex>
          )
        })}
        {showViewAll && (
          <Flex gap={[3, 4]} align="start" py={3} position="relative">
            <Box flexShrink={0} mt="6px">
              <Box w="14px" h="14px" borderRadius="full" border="2px dashed" borderColor={dotBorder} position="relative">
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={dotBorder}
                />
              </Box>
            </Box>
            <Link href="/experience" _hover={{ textDecoration: 'none' }}>
              <HStack spacing={2} color={textColor} fontSize="xs" fontFamily="mono" transition="all 0.15s" _hover={{ color: 'cyan.400' }} mt="3px">
                <Text>{t('about.viewAllExperience')}</Text>
                <Text>→</Text>
              </HStack>
            </Link>
          </Flex>
        )}
      </VStack>
    </Box>
  )

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <VStack spacing={8} align="stretch">
          {groups.map((group, index) => (
            <Box key={group.title} w="full">
              <Flex align="center" gap={3} w="full" mb={4}>
                <Box h="2px" w="20px" bg="cyan.400" borderRadius="full" flexShrink={0} />
                <Heading size={["sm", "md"]} fontWeight="semibold">{group.title}</Heading>
                <Box flex="1" h="1px" bg={lineColor} />
              </Flex>
              {renderTimeline(group.phases, index === groups.length - 1)}
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  )
}

export default JourneySection
