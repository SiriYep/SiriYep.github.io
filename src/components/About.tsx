import { Box, VStack, Flex, Heading, Badge, Container, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { useSlot } from '@/templates/context'
import { DEFAULT_SECTIONS } from '@/templates/slots'
import type { SlotName } from '@/templates/slots'

function About() {
  const { t } = useTranslation()
  const { research, experience, news, siteConfig, institutionLogos } = useLocalizedData()

  const cfg = siteConfig as Record<string, unknown>
  const sectionOrder = (cfg.sections as string[] | undefined) ?? DEFAULT_SECTIONS

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      if (!a.sortDate && !b.sortDate) return 0
      if (!a.sortDate) return 1
      if (!b.sortDate) return -1
      return b.sortDate.localeCompare(a.sortDate)
    })
  }, [news])

  const HeroSection = useSlot('hero')
  const NewsDisplay = useSlot('newsDisplay')
  const Footer = useSlot('footer')
  const Bio = useSlot('bio')
  const Skills = useSlot('skills')
  const Journey = useSlot('journey')
  const Mentorship = useSlot('mentorship')
  const SelectedPublications = useSlot('selectedPublications')
  const Talks = useSlot('talks')
  const Teaching = useSlot('teaching')
  const Accomplishments = useSlot('accomplishments')
  const Contact = useSlot('contact')

  const renderSection = (sectionId: string, index: number) => {
    const key = `${sectionId}-${index}`
    switch (sectionId as SlotName) {
      case 'hero':
        return (
          <HeroSection
            key={key}
            title={siteConfig.title}
            avatar={siteConfig.avatar}
            research={research.currentResearch}
            researchLogos={institutionLogos}
            education={experience.education.courses.slice(0, 1)}
            educationLogos={institutionLogos}
          />
        )
      case 'newsDisplay':
        return (
          <Box key={key} w="full">
            <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
              <Flex align="center" gap={3} mb={5}>
                <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
                <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.recentUpdates')}</Heading>
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  fontSize="2xs"
                  fontFamily="mono"
                  letterSpacing="wide"
                  borderRadius="6px"
                  px={1.5}
                >
                  {t('about.news')}
                </Badge>
                <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
              </Flex>
              <NewsDisplay news={sortedNews} showHeader={false} />
            </Container>
          </Box>
        )
      case 'footer':
        return <Footer key={key} />
      case 'bio':
        return <Bio key={key} />
      case 'skills':
        return <Skills key={key} />
      case 'journey':
        return <Journey key={key} />
      case 'mentorship':
        return <Mentorship key={key} />
      case 'selectedPublications':
        return <SelectedPublications key={key} />
      case 'talks':
        return <Talks key={key} />
      case 'teaching':
        return <Teaching key={key} />
      case 'accomplishments':
        return <Accomplishments key={key} />
      case 'contact':
        return <Contact key={key} />
      default:
        return null
    }
  }

  return (
    <Box w="full">
      <VStack spacing={[4, 6, 8]} align="stretch" w="full">
        {sectionOrder.map((sectionId, index) => renderSection(sectionId, index))}
      </VStack>
    </Box>
  )
}

export default About
