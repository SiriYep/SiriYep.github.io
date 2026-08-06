import { Box, VStack, Text, useColorModeValue, Image, HStack, Container, Stack, Link, Flex, SimpleGrid, Heading, Tooltip } from '@chakra-ui/react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { withBase } from '@/utils/asset'
import DynamicIcon from '../DynamicIcon'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { cvEntries } from '@/generated/cv-manifest'

const MotionBox = motion(Box)
const MotionText = motion(Text)

// Fixed row height for the rotating-subtitle ticker (constant across breakpoints
// so the animated y offsets always line up with the visible window).
const TICKER_ROW_PX = 22

interface ResearchItem {
  lab: string
  emoji: string
  advisor?: string
  advisorUrl?: string
  focus: string
  link: string
}

interface EducationItem {
  course: string
  institution: string
  year: string
}

// Hero Section Component
interface HeroSectionProps {
  title: string
  avatar: string
  research?: ResearchItem[]
  researchLogos?: Record<string, string>
  education?: EducationItem[]
  educationLogos?: Record<string, string>
}

const HeroSection = ({ title, avatar, research = [], researchLogos = {}, education = [], educationLogos = {} }: HeroSectionProps) => {
  const { t, i18n } = useTranslation()
  const { siteOwner, siteConfig } = useLocalizedData()
  const [isCvOpen, setIsCvOpen] = useState(false)
  const headingColor = useColorModeValue('gray.800', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const bg = useColorModeValue('gray.50', 'gray.900')
  const socialIconColor = useColorModeValue('gray.400', 'gray.500')
  const nameGradient = useColorModeValue(
    'linear(to-r, #1f7a99, #7a5299)',
    'linear(to-r, #9fd8e5, #c7a9ce)',
  )
  const emailLinks = [
    siteOwner.contact.academicEmail && {
      icon: 'FaGraduationCap',
      label: t('contact.academicEmailLabel', 'Academic'),
      value: siteOwner.contact.academicEmail,
    },
    siteOwner.contact.personalEmail && {
      icon: 'FaEnvelope',
      label: t('contact.personalEmailLabel', 'Personal'),
      value: siteOwner.contact.personalEmail,
    },
  ].filter(Boolean) as { icon: string; label: string; value: string }[]
  const heroSocialIcons = (siteConfig.heroSocialIcons ?? []).map(item => ({
    ...item,
    href: (siteConfig.social as Record<string, string>)[item.platform] ?? '',
  }))
  const isZh = i18n.language.startsWith('zh')
  const cvUpdatedLabel = isZh ? '最新更新' : 'Last updated'
  const getCvLabel = (lang: string) => {
    if (isZh) return lang === 'zh' ? '中文简历' : '英文简历'
    return lang === 'zh' ? 'Chinese CV' : 'English CV'
  }
  const getCvTooltipLabel = (entry: { lang: string; updated: string }) => {
    const label = getCvLabel(entry.lang)
    return (
      <VStack spacing={0.5} align="center">
        <Text as="span" fontWeight="semibold">{label}</Text>
        <Text as="span" opacity={0.85}>{cvUpdatedLabel}: {entry.updated}</Text>
      </VStack>
    )
  }

  // Ticker keyframes derived from the actual subtitle count: step through each
  // row, then loop back to the top. Times stay evenly spaced with a short hold.
  const rotatingSubtitles = siteOwner.rotatingSubtitles
  const tickerCount = Math.max(rotatingSubtitles.length, 1)
  const tickerY = [...rotatingSubtitles.map((_, i) => -TICKER_ROW_PX * i), 0]
  const tickerTimes = tickerY.map((_, i) => (i / tickerCount) * 0.9)
  const tickerDuration = (tickerCount * 4) / 3

  return (
    <Box
      w="full"
      bg={bg}
      py={[4, 5, 10]}
      mt={[2, 3, 4]}
      borderBottom="1px solid"
      borderColor="var(--border-color)"
    >
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Stack
          direction={['column', 'column', 'row']}
          spacing={[3, 4, 6]}
          align="center"
          justify="space-between"
        >
          <VStack spacing={[2, 3]} align={['center', 'center', 'flex-start']} flex="1">
            <MotionText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              as="h1"
              fontSize={["lg", "xl", "3xl"]}
              fontWeight="bold"
              fontFamily="mono"
              letterSpacing="-0.01em"
              color={headingColor}
              lineHeight="shorter"
              mb={[1, 2, 3]}
              display="flex"
              alignItems="center"
              gap={[1, 2]}
              flexWrap={["wrap", "wrap", "nowrap"]}
              textAlign={["center", "center", "left"]}
              w="full"
              sx={{
                justifyContent: ["center", "center", "flex-start"]
              }}
            >
              <MotionText
                as="span"
                color="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                $
              </MotionText>
              <MotionText
                as="span"
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                overflow="hidden"
                whiteSpace="nowrap"
                display="inline-block"
              >
                {t('hero.greeting')}{' '}
              </MotionText>
              <MotionText
                as="span"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.6 }}
                color="accent"
                fontFamily="mono"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <MotionText
                  as="span"
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  overflow="hidden"
                  whiteSpace="nowrap"
                  bgGradient={nameGradient}
                  bgClip="text"
                >
                  {siteOwner.name.display}
                </MotionText>
                <Text
                  as="span"
                  aria-hidden="true"
                  color="accent"
                  sx={{
                    '@keyframes heroCursorBlink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0 },
                    },
                    animation: 'heroCursorBlink 1.1s step-end infinite',
                  }}
                >
                  ▋
                </Text>
              </MotionText>
            </MotionText>

            <HStack
              spacing={[1, 2]}
              mb={[2, 3, 4]}
              justify={['center', 'center', 'flex-start']}
              flexWrap="wrap"
              w="full"
            >
              <Text color="prompt" fontFamily="mono" fontWeight="700" fontSize={["xs", "sm"]}>$</Text>
              <Text fontSize={["xs", "sm"]} color={textColor}>{t('hero.sometimesI')}</Text>
              <Box h={`${TICKER_ROW_PX}px`} overflow="hidden">
                <MotionBox
                  animate={{ y: tickerY }}
                  transition={{
                    duration: tickerDuration,
                    times: tickerTimes,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {rotatingSubtitles.map((text, index) => (
                    <Text
                      key={index}
                      h={`${TICKER_ROW_PX}px`}
                      lineHeight={`${TICKER_ROW_PX}px`}
                      color="accent"
                      fontWeight="semibold"
                      fontSize={["xs", "sm"]}
                      fontFamily="mono"
                    >
                      {text}
                    </Text>
                  ))}
                </MotionBox>
              </Box>
            </HStack>


            <Box w="full" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />

            {/* Research & Education compact section */}
            {(research.length > 0 || education.length > 0) && (
              <SimpleGrid columns={[1, 1, 2]} spacing={[3, 3, 4]} w="full">
                {research.length > 0 && (
                  <VStack align="start" spacing={2}>
                    <HStack spacing={2} align="center">
                      <Box w="3px" h="12px" bg="accent" borderRadius="full" flexShrink={0} />
                      <Heading size="xs" fontFamily="mono" color="textMuted" textTransform="uppercase" letterSpacing="wider" fontSize="2xs">
                        {t('about.researchExperience', 'Research & Internships')}
                      </Heading>
                    </HStack>
                    {research.map((item, index) => {
                      const logo = researchLogos[item.lab]
                      const cardHref = item.advisorUrl || item.link
                      return (
                        <Link key={index} href={cardHref} isExternal _hover={{ textDecoration: 'none' }} w="full">
                          <HStack
                            spacing={2.5}
                            p={2}
                            minH="46px"
                            align="center"
                            borderRadius="10px"
                            border="1px solid"
                            borderColor="transparent"
                            transition="background 0.2s ease, border-color 0.2s ease"
                            _hover={{ bg: 'var(--hover-color)', borderColor: 'var(--border-color)' }}
                          >
                            <Flex
                              w="32px"
                              h="32px"
                              borderRadius="8px"
                              bg="var(--elevated-bg)"
                              border="1px solid"
                              borderColor="var(--border-color)"
                              align="center"
                              justify="center"
                              flexShrink={0}
                            >
                              {logo ? (
                                <Image src={withBase(logo)} alt={item.lab} maxW="26px" maxH="26px" objectFit="contain" />
                              ) : (
                                <Text fontSize="sm">{item.emoji}</Text>
                              )}
                            </Flex>
                            <VStack align="start" spacing={0} flex={1} minW={0}>
                              <Text fontSize={["xs", "sm"]} fontWeight="medium" lineHeight="short" color={headingColor}>{item.lab}</Text>
                              <Text fontSize="2xs" color={textColor} lineHeight="short" noOfLines={1}>
                                {item.advisor ? (
                                  <>
                                    <Text as="span" color={textColor}>{t('hero.advisorPrefix', 'Advisor: ')}</Text>
                                    <Text as="span" color="accent" fontWeight="semibold">{item.advisor}</Text>
                                  </>
                                ) : item.focus}
                              </Text>
                            </VStack>
                          </HStack>
                        </Link>
                      )
                    })}
                  </VStack>
                )}
                {education.length > 0 && (
                  <VStack align="start" spacing={2}>
                    <HStack spacing={2} align="center">
                      <Box w="3px" h="12px" bg="accent" borderRadius="full" flexShrink={0} />
                      <Heading size="xs" fontFamily="mono" color="textMuted" textTransform="uppercase" letterSpacing="wider" fontSize="2xs">
                        {t('about.educationJourney', 'Education')}
                      </Heading>
                    </HStack>
                    {education.map((item, index) => {
                      const logo = educationLogos[item.institution]
                      return (
                        <HStack
                          key={index}
                          spacing={2.5}
                          p={2}
                          minH="46px"
                          align="center"
                          borderRadius="10px"
                          border="1px solid"
                          borderColor="transparent"
                          transition="background 0.2s ease, border-color 0.2s ease"
                          _hover={{ bg: 'var(--hover-color)', borderColor: 'var(--border-color)' }}
                          w="full"
                        >
                          <Flex
                            w="32px"
                            h="32px"
                            borderRadius="8px"
                            bg="var(--elevated-bg)"
                            border="1px solid"
                            borderColor="var(--border-color)"
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            {logo ? (
                              <Image src={withBase(logo)} alt={item.institution} maxW="26px" maxH="26px" objectFit="contain" />
                            ) : (
                              <Text fontSize="sm" fontWeight="bold" color="accent">{item.institution.charAt(0)}</Text>
                            )}
                          </Flex>
                          <VStack align="start" spacing={0} flex={1} minW={0}>
                            <Text fontSize={["xs", "sm"]} fontWeight="medium" lineHeight="short" color={headingColor}>{item.course}</Text>
                            <Text fontSize="2xs" color={textColor} lineHeight="short">{item.institution} · {item.year}</Text>
                          </VStack>
                        </HStack>
                      )
                    })}
                  </VStack>
                )}
              </SimpleGrid>
            )}

            <Box w="full" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />

            {/* Welcome + contact */}
            <Flex w="full" direction={['column', 'column', 'row']} align={['center', 'center', 'center']} gap={[2, 2, 4]}>
              <Text
                fontSize="sm"
                color="var(--secondary-text)"
                lineHeight="tall"
                textAlign="left"
                flex={1}
                borderLeft="2px solid"
                borderColor="accent"
                pl={3}
              >
                {siteConfig.tagline ?? ''}
              </Text>
              <VStack spacing={1.5} align={['center', 'center', 'flex-start']} flexShrink={0}>
                {emailLinks.map((email) => (
                  <Tooltip key={email.label} label={`${email.label}: mailto:${email.value}`} fontSize="xs" hasArrow placement="top" openDelay={200} fontFamily="mono">
                    <Link href={`mailto:${email.value}`} isExternal _hover={{ textDecoration: 'none' }}>
                      <HStack
                        spacing={1.5}
                        px={2.5}
                        py={1}
                        border="1px solid"
                        borderColor="var(--border-color)"
                        borderRadius="8px"
                        color="var(--secondary-text)"
                        transition="border-color 0.15s ease, color 0.15s ease"
                        _hover={{ borderColor: 'accent', color: 'accent' }}
                      >
                        <DynamicIcon name={email.icon} boxSize={3.5} />
                        <Text as="span" fontSize="2xs" fontFamily="mono" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                          {email.label}
                        </Text>
                        <Text fontSize="xs" fontFamily="mono" maxW={["170px", "220px", "260px"]} isTruncated>
                          {email.value}
                        </Text>
                      </HStack>
                    </Link>
                  </Tooltip>
                ))}
                {siteOwner.social.linkedin && (
                  <Link href={siteOwner.social.linkedin} isExternal _hover={{ textDecoration: 'none' }}>
                    <HStack
                      spacing={1.5}
                      px={2.5}
                      py={1}
                      border="1px solid"
                      borderColor="var(--border-color)"
                      borderRadius="8px"
                      color="var(--secondary-text)"
                      transition="border-color 0.15s ease, color 0.15s ease"
                      _hover={{ borderColor: 'accent', color: 'accent' }}
                    >
                      <DynamicIcon name="FaLinkedin" boxSize={3.5} />
                      <Text fontSize="xs" fontFamily="mono">linkedin</Text>
                    </HStack>
                  </Link>
                )}
              </VStack>
            </Flex>
          </VStack>
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={[2, 3]}>
              <Box
                position="relative"
                transition="transform 0.25s ease"
                _hover={{ transform: 'translateY(-3px)' }}
              >
                <Box
                  aria-hidden="true"
                  position="absolute"
                  top="10px"
                  left="10px"
                  right="-10px"
                  bottom="-10px"
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="var(--accent-color)"
                  opacity={0.35}
                  pointerEvents="none"
                />
                <Image
                  src={withBase(`images/${avatar}`)}
                  alt={title}
                  position="relative"
                  borderRadius="16px"
                  w={["150px", "180px", "220px"]}
                  h={["200px", "240px", "293px"]}
                  objectFit="contain"
                  bg="var(--card-bg)"
                  border="1px solid"
                  borderColor="var(--border-color)"
                  boxShadow="var(--shadow-card)"
                />
              </Box>
              <Box position="relative" w="full" display="flex" justifyContent="center">
                {/* Social icons row below avatar */}
                <HStack spacing={[1, 1.5]} justify="center">
                  {heroSocialIcons.map((item) => {
                    const isCv = item.platform === 'cv'
                    const icon = (
                      <Box
                        as={isCv ? 'button' : 'span'}
                        aria-expanded={isCv ? isCvOpen : undefined}
                        aria-label={item.label}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        p={1.5}
                        bg="transparent"
                        border="0"
                        cursor="pointer"
                        color={socialIconColor}
                        lineHeight="1"
                        transition="all 0.2s"
                        _hover={{ color: item.color, transform: 'scale(1.2)' }}
                        _focusVisible={{ outline: '1px solid', outlineColor: item.color }}
                        onClick={isCv ? () => setIsCvOpen(open => !open) : undefined}
                      >
                        <DynamicIcon name={item.icon} boxSize={[3, 3.5]} />
                      </Box>
                    )

                    return (
                      <Tooltip key={item.label} label={item.label} fontSize="xs" hasArrow placement="bottom" openDelay={200} fontFamily="mono">
                        {isCv ? icon : (
                          <Link href={item.href} isExternal _hover={{ textDecoration: 'none' }}>
                            {icon}
                          </Link>
                        )}
                      </Tooltip>
                    )
                  })}
                </HStack>
                <HStack
                  spacing={1.5}
                  justify="center"
                  flexWrap="wrap"
                  position="absolute"
                  top="calc(100% + 4px)"
                  left="50%"
                  zIndex={10}
                  w="max-content"
                  maxW="260px"
                  opacity={isCvOpen ? 1 : 0}
                  pointerEvents={isCvOpen ? 'auto' : 'none'}
                  visibility={isCvOpen ? 'visible' : 'hidden'}
                  transform={isCvOpen ? 'translate(-50%, 0)' : 'translate(-50%, -4px)'}
                  transition="opacity 0.16s ease, transform 0.16s ease, visibility 0.16s"
                >
                  {cvEntries.map((entry) => (
                    <Tooltip key={entry.lang} label={getCvTooltipLabel(entry)} fontSize="xs" hasArrow placement="bottom" openDelay={200} fontFamily="mono">
                      <Link
                        href={withBase(entry.href)}
                        isExternal
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        px={2.5}
                        py={1}
                        bg="var(--elevated-bg)"
                        color="var(--secondary-text)"
                        border="1px solid"
                        borderColor="var(--border-color)"
                        borderRadius="8px"
                        boxShadow="var(--shadow-sm)"
                        fontFamily="mono"
                        fontSize="2xs"
                        _hover={{ color: 'accent', borderColor: 'accent', textDecoration: 'none' }}
                        transition="border-color 0.15s ease, color 0.15s ease"
                      >
                        <DynamicIcon name="FaFileAlt" boxSize={2.5} />
                        <Text as="span">{getCvLabel(entry.lang)}</Text>
                      </Link>
                    </Tooltip>
                  ))}
                </HStack>
              </Box>
              {((siteConfig.pets ?? []) as { name: string; emoji: string; image: string }[]).length > 0 && (
                <HStack spacing={[4, 5]} justify="center">
                  {((siteConfig.pets ?? []) as { name: string; emoji: string; image: string }[]).map((pet) => (
                    <VStack key={pet.name} spacing={2}>
                      {pet.image && (
                        <Image
                          src={pet.image}
                          alt={pet.name}
                          borderRadius="full"
                          boxSize={["40px", "50px"]}
                          objectFit="cover"
                        />
                      )}
                      <Text fontSize="sm" fontWeight="medium">{pet.name} {pet.emoji}</Text>
                    </VStack>
                  ))}
                </HStack>
              )}
            </VStack>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  )
}

export default HeroSection
