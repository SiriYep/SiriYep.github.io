import React from 'react'
import { Box, VStack, HStack, Text, useColorMode, useColorModeValue, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody, Container, Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import DynamicIcon from './DynamicIcon'
import type { Award } from '../types'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { terminalPalette } from '@/config/theme'

const iconFor = (a: Award): string => {
  if (a.kind === 'grant') return 'FaCoins'
  if (a.kind === 'hackathon') return 'FaTrophy'
  if (a.kind === 'travel') return 'FaPlane'
  if (a.kind === 'scholarship') return 'FaGraduationCap'
  if (a.kind === 'honor') return 'FaMedal'
  if (a.kind === 'employment') return 'FaBriefcase'
  if (a.kind === 'innovation') return 'FaLightbulb'
  if (a.kind === 'competition') {
    const t = (a.title + ' ' + (a.org || '')).toLowerCase()
    if (t.includes('first')) return 'FaTrophy'
    if (t.includes('second')) return 'FaMedal'
    if (t.includes('third')) return 'FaAward'
    if (t.includes('meritorious')) return 'FaStar'
    if (t.includes('honorable')) return 'FaAward'
    return 'FaChartBar'
  }
  return 'FaCoins'
}

const kindMeta: Record<string, { labelKey: string; color: [string, string] }> = {
  grant: { labelKey: 'awards.grant', color: ['yellow.600', 'yellow.300'] },
  hackathon: { labelKey: 'awards.hackathon', color: ['purple.500', 'purple.300'] },
  travel: { labelKey: 'awards.travel', color: ['blue.500', 'blue.300'] },
  scholarship: { labelKey: 'awards.scholarship', color: ['purple.500', 'purple.300'] },
  honor: { labelKey: 'awards.honor', color: ['orange.500', 'yellow.300'] },
  employment: { labelKey: 'awards.employment', color: ['blue.500', 'blue.300'] },
  competition: { labelKey: 'awards.competition', color: ['orange.500', 'orange.300'] },
  innovation: { labelKey: 'awards.innovation', color: ['cyan.600', 'cyan.300'] },
  other: { labelKey: 'awards.other', color: ['gray.500', 'gray.400'] },
}

const isBestPaperAward = (title: string) =>
  title.toLowerCase().includes('best paper') || title.includes('最佳论文')

const awardPrefix = (title: string) => {
  const normalized = title.toLowerCase()
  if (isBestPaperAward(title)) return '🏆 '
  if (normalized.includes('highest honor') || title.includes('最高荣誉')) return '🏆 '
  if (normalized.includes('outstanding graduate') || title.includes('优秀毕业生')) return '🏅 '
  if (normalized.includes('merit student') || title.includes('三好学生')) return '🏅 '
  if (normalized.includes('outstanding league member') || title.includes('优秀团员')) return '🏅 '
  if (normalized.includes('grand') || title.includes('特等奖')) return '🎖️ '
  if (normalized.includes('first') || title.includes('一等')) return '🥇 '
  if (normalized.includes('second') || title.includes('二等')) return '🥈 '
  return ''
}

const AwardRow = ({ award }: { award: Award }) => {
  const { t } = useTranslation()
  const meta = kindMeta[award.kind || 'other']
  const kindColor = useColorModeValue(meta.color[0], meta.color[1])

  const content = (
    <Flex
      align="start"
      gap={3}
      py={2.5}
      borderBottom="1px solid"
      borderColor="var(--border-color)"
      cursor={award.egg ? 'pointer' : 'default'}
      transition="padding 0.15s ease"
      _hover={award.egg ? { pl: 1 } : undefined}
    >
      <Box mt="2px" flexShrink={0}>
        <DynamicIcon name={iconFor(award)} boxSize={3.5} color={kindColor} />
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" fontWeight="medium" color="textPrimary" lineHeight="short">
          {awardPrefix(award.title)}{award.title}
        </Text>
        <HStack spacing={2} mt={0.5} flexWrap="wrap">
          {award.org && (
            <Text fontSize="2xs" color="textMuted">{award.org}</Text>
          )}
        </HStack>
      </Box>
      <VStack spacing={0.5} align="end" flexShrink={0}>
        <Text fontSize="xs" fontFamily="mono" color="textMuted" whiteSpace="nowrap">
          {award.date}
        </Text>
        <Text fontSize="2xs" fontFamily="mono" color={kindColor} textTransform="uppercase" letterSpacing="wide">
          {t(meta.labelKey)}
        </Text>
      </VStack>
    </Flex>
  )

  if (award.egg) {
    return (
      <Popover trigger="hover" placement="top-start">
        <PopoverTrigger>
          {content}
        </PopoverTrigger>
        <PopoverContent
          bg="var(--elevated-bg)"
          borderColor="var(--border-color)"
          borderRadius="10px"
          maxW="360px"
          boxShadow="var(--shadow-card)"
        >
          <PopoverArrow bg="var(--elevated-bg)" />
          <PopoverBody py={3} px={4}>
            <HStack spacing={2} mb={2}>
              <DynamicIcon name={iconFor(award)} boxSize={3} color="accent" />
              <Text fontSize="xs" fontFamily="mono" color="accent" fontWeight="semibold">
                Easter Egg
              </Text>
            </HStack>
            <Text fontSize="xs" color="textSecondary" lineHeight="tall">
              {award.egg}
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    )
  }

  return content
}

const AccomplishmentsTerminal: React.FC = () => {
  const { t } = useTranslation()
  const { awards } = useLocalizedData()
  const { colorMode } = useColorMode()
  const pal = terminalPalette.colors(colorMode === 'dark')

  return (
    <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
      <Flex align="center" gap={3} mb={5}>
        <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
        <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.awardsAndHonors')}</Heading>
        <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
      </Flex>

      <Box
        borderRadius="12px"
        overflow="hidden"
        border="1px solid"
        borderColor={pal.border}
        boxShadow="var(--shadow-card)"
        bg={pal.bg}
      >
        {/* Title bar */}
        <Flex align="center" px={4} py={2.5} bg={pal.header} borderBottom="1px solid" borderColor={pal.border} position="relative">
          <HStack spacing={2}>
            <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" opacity={0.9} />
            <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" opacity={0.9} />
            <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" opacity={0.9} />
          </HStack>
          <Text
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            fontFamily="mono"
            fontSize="12px"
            color={pal.secondary}
            whiteSpace="nowrap"
          >
            awards — zsh
          </Text>
        </Flex>

        {/* Body */}
        <Box px={[3, 4, 5]} py={4}>
          <HStack spacing={2} fontFamily="mono" fontSize="13px" flexWrap="wrap">
            <Text color={pal.prompt}>$</Text>
            <Text color={pal.command}>ls</Text>
            <Text color={pal.param}>./awards</Text>
          </HStack>
          <Text fontFamily="mono" fontSize="12px" color={pal.info} mt={1} mb={3}>
            {awards.length} {t('about.awardsSpanning')} {new Set(awards.map(a => a.kind)).size} {t('about.categories')}
          </Text>
          <VStack spacing={0} align="stretch">
            {awards.map((a, i) => (
              <AwardRow key={i} award={a} />
            ))}
          </VStack>
        </Box>
      </Box>
    </Container>
  )
}

export default AccomplishmentsTerminal
