import { Box, VStack, Text, useColorModeValue, Image, HStack, Container, Grid, GridItem, Link, Flex, SimpleGrid, Tooltip } from '@chakra-ui/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { withBase } from '@/utils/asset'
import DynamicIcon from '../DynamicIcon'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { cvEntries } from '@/generated/cv-manifest'
import InstitutionLogo from '../InstitutionLogo'

const MotionBox = motion(Box)
const MotionText = motion(Text)

// Fixed row height for the rotating-subtitle ticker (constant across breakpoints
// so the animated y offsets always line up with the visible window).
const TICKER_ROW_PX = 22

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard API unavailable (non-secure context) — legacy fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

interface ResearchItem {
  lab: string
  emoji: string
  advisor?: string
  advisorUrl?: string
  focus: string
  link: string
  statusKind?: 'academic' | 'internship' | 'collaboration'
  role?: string
  period?: string
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

const CurrentStatusPanel = ({
  label,
  children,
  accentGradient,
  isZh,
  secondary = false,
}: {
  label: string
  children: ReactNode
  accentGradient: string
  isZh: boolean
  secondary?: boolean
}) => (
  <Box
    py={[1, 2]}
    pr={{ base: 0, md: secondary ? 0 : 6 }}
    pl={{ base: 0, md: secondary ? 6 : 0 }}
    mt={{ base: secondary ? 5 : 0, md: 0 }}
    pt={{ base: secondary ? 5 : 1, md: 1 }}
    borderTopWidth={{ base: secondary ? '1px' : '0', md: '0' }}
    borderLeftWidth={{ base: '0', md: secondary ? '1px' : '0' }}
    borderColor="var(--border-color)"
  >
    <HStack spacing={2} mb={4} align="center">
      <Box w="24px" h="3px" bgGradient={accentGradient} borderRadius="full" flexShrink={0} />
      <Text
        fontFamily={isZh ? 'body' : 'mono'}
        color="textPrimary"
        textTransform={isZh ? 'none' : 'uppercase'}
        letterSpacing={isZh ? '0.08em' : '0.1em'}
        fontSize={{ base: '0.75rem', md: '0.8125rem' }}
        fontWeight="700"
        lineHeight="1.4"
      >
        {label}
      </Text>
    </HStack>
    <VStack align="stretch" spacing={4}>{children}</VStack>
  </Box>
)

const CurrentStatusSection = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <Box>
    <Text
      mb={2.5}
      fontFamily="body"
      color="textSecondary"
      textTransform="none"
      letterSpacing="0.025em"
      fontSize={{ base: '0.6875rem', md: '0.75rem' }}
      fontWeight="600"
      lineHeight="1.4"
    >
      {label}
    </Text>
    <VStack align="stretch" spacing={2.5}>{children}</VStack>
  </Box>
)

const CurrentStatusDivider = () => (
  <Box
    h="1px"
    bgGradient="linear(to-r, var(--border-color), transparent)"
    opacity={0.7}
  />
)

const HeroSection = ({ title, avatar, research = [], researchLogos = {}, education = [], educationLogos = {} }: HeroSectionProps) => {
  const { t, i18n } = useTranslation()
  const { siteOwner, siteConfig } = useLocalizedData()
  const [isCvOpen, setIsCvOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const handleCopyEmail = (email: { label: string; value: string }) => {
    void copyText(email.value)
    setCopiedEmail(email.label)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopiedEmail(null), 1600)
  }
  const headingColor = useColorModeValue('gray.800', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const socialIconColor = useColorModeValue('gray.500', 'gray.500')
  const nameGradient = useColorModeValue(
    'linear(112deg, #ef6a38, #c44fbf, #3a5fd9)',
    'linear(112deg, #f0854e, #d76ad4, #8aa2f2)',
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

  const academicItems = research.filter((item) => item.statusKind === 'academic')
  const internshipItems = research.filter((item) => item.statusKind === 'internship')
  const collaborationItems = research.filter((item) => item.statusKind === 'collaboration')

  const renderResearchRows = (items: ResearchItem[]) => items.map((item) => {
    const logo = researchLogos[item.lab]
    return (
      <HStack key={item.lab} spacing={3} align="center" minW={0}>
        <InstitutionLogo
          src={logo ? withBase(logo) : undefined}
          label={item.lab}
          fallback={item.emoji}
          size="md"
          framed
        />
        <VStack align="start" spacing={0.5} flex={1} minW={0}>
          <Link
            href={item.link}
            isExternal
            fontSize={["xs", "sm"]}
            fontWeight="semibold"
            lineHeight="short"
            color={headingColor}
            _hover={{ color: 'accent', textDecoration: 'none' }}
          >
            {item.lab}
          </Link>
          <Text fontSize={{ base: '0.6875rem', md: 'xs' }} color={textColor} lineHeight="short">
            {item.role ?? item.focus}{item.period ? ` · ${item.period}` : ''}
          </Text>
          {item.advisor && (
            <Text fontSize={{ base: '0.6875rem', md: 'xs' }} color={textColor} lineHeight="short">
              {t('hero.advisorPrefix', 'Advisor: ')}
              {item.advisorUrl ? (
                <Link href={item.advisorUrl} isExternal color="textPrimary" fontWeight="semibold" textDecoration="underline" textDecorationColor="var(--border-strong)" textUnderlineOffset="2px" _hover={{ color: 'accent', textDecorationColor: 'accent' }}>
                  {item.advisor}
                </Link>
              ) : item.advisor}
            </Text>
          )}
        </VStack>
      </HStack>
    )
  })

  return (
    <Box
      w="full"
      bg="transparent"
      py={[4, 5, 10]}
      mt={[2, 3, 4]}
      position="relative"
      _after={{
        content: '""',
        position: 'absolute',
        left: { base: 2, md: 8 },
        right: { base: 2, md: 8 },
        bottom: 0,
        h: '1px',
        bgGradient: 'linear(to-r, transparent, var(--border-color) 12%, var(--border-color) 88%, transparent)',
        pointerEvents: 'none',
      }}
    >
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Grid
          templateAreas={{
            base: '"intro" "avatar" "status" "contact"',
            lg: '"intro avatar" "status avatar" "contact avatar"',
          }}
          templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) auto' }}
          columnGap={6}
          rowGap={[3, 4]}
          alignItems={{ base: 'stretch', lg: 'center' }}
        >
          <GridItem gridArea="intro" minW={0}>
          <VStack spacing={[2, 3]} align={{ base: 'center', lg: 'flex-start' }}>
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
              textAlign={{ base: 'center', lg: 'left' }}
              w="full"
              justifyContent={{ base: 'center', lg: 'flex-start' }}
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
              justify={{ base: 'center', lg: 'flex-start' }}
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
          </VStack>
          </GridItem>

          {(research.length > 0 || education.length > 0) && (
            <GridItem gridArea="status" minW={0}>
              <Box w="full" h="1px" mb={[3, 4]} bgGradient="linear(to-r, var(--border-strong), transparent)" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0} w="full">
                <CurrentStatusPanel label={t('hero.academicAndEducation', 'Academic & education')} accentGradient={nameGradient} isZh={isZh}>
                  <CurrentStatusSection label={t('hero.academicAffiliation', 'Academic affiliation')}>
                    {renderResearchRows(academicItems)}
                  </CurrentStatusSection>
                  <CurrentStatusDivider />
                  <CurrentStatusSection label={t('hero.currentEducation', 'Current education')}>
                    {education.map((item) => {
                      const logo = educationLogos[item.institution]
                      return (
                        <HStack key={`${item.institution}-${item.course}`} spacing={3} align="center" minW={0}>
                          <InstitutionLogo
                            src={logo ? withBase(logo) : undefined}
                            label={item.institution}
                            fallback={item.institution.charAt(0)}
                            size="md"
                            framed
                          />
                          <VStack align="start" spacing={0.5} flex={1} minW={0}>
                            <Text fontSize={["xs", "sm"]} fontWeight="semibold" lineHeight="short" color={headingColor}>{item.course}</Text>
                            <Text fontSize={{ base: '0.6875rem', md: 'xs' }} color={textColor} lineHeight="short">{item.institution} · {item.year}</Text>
                          </VStack>
                        </HStack>
                      )
                    })}
                  </CurrentStatusSection>
                </CurrentStatusPanel>
                <CurrentStatusPanel label={t('about.researchExperience', 'Experience & research collaborations')} accentGradient={nameGradient} isZh={isZh} secondary>
                  {internshipItems.length > 0 && (
                    <CurrentStatusSection label={t('hero.currentInternship', 'Current internship')}>
                      {renderResearchRows(internshipItems)}
                    </CurrentStatusSection>
                  )}
                  {internshipItems.length > 0 && collaborationItems.length > 0 && <CurrentStatusDivider />}
                  {collaborationItems.length > 0 && (
                    <CurrentStatusSection label={t('hero.researchCollaborations', 'Research collaborations')}>
                      {renderResearchRows(collaborationItems)}
                    </CurrentStatusSection>
                  )}
                </CurrentStatusPanel>
              </SimpleGrid>
            </GridItem>
          )}

          <GridItem gridArea="contact" minW={0}>
            <Box w="full" h="1px" mb={[3, 4]} bgGradient="linear(to-r, var(--border-strong), transparent)" />

            {/* Welcome + contact */}
            <Flex w="full" direction={['column', 'column', 'row']} align="center" gap={[2, 2, 4]}>
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
                {emailLinks.map((email) => {
                  const isCopied = copiedEmail === email.label
                  return (
                    <Tooltip key={email.label} label={t('contact.clickToCopy', 'Click to copy')} fontSize="xs" hasArrow placement="top" openDelay={200} fontFamily="mono">
                      <HStack
                        as="button"
                        type="button"
                        aria-label={`${t('contact.clickToCopy', 'Click to copy')}: ${email.value}`}
                        onClick={() => handleCopyEmail(email)}
                        cursor="pointer"
                        bg="transparent"
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
                        <DynamicIcon name={isCopied ? 'FaCheck' : email.icon} boxSize={3.5} color={isCopied ? 'prompt' : undefined} />
                        <Text as="span" fontSize="2xs" fontFamily="mono" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                          {email.label}
                        </Text>
                        {/* Value keeps its width while "copied ✓" overlays it, so the chip never resizes */}
                        <Box as="span" position="relative" display="inline-block" maxW={["170px", "220px", "260px"]}>
                          <Text fontSize="xs" fontFamily="mono" isTruncated visibility={isCopied ? 'hidden' : 'visible'}>
                            {email.value}
                          </Text>
                          {isCopied && (
                            <Flex as="span" position="absolute" inset={0} align="center" justify="center" fontSize="xs" fontFamily="mono" color="prompt" whiteSpace="nowrap">
                              {t('contact.copied', 'copied')} ✓
                            </Flex>
                          )}
                        </Box>
                      </HStack>
                    </Tooltip>
                  )
                })}
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
          </GridItem>
          <GridItem gridArea="avatar" justifySelf="center" alignSelf="center">
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
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default HeroSection
