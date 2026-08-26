import { Box, Container, VStack, HStack, Text, Heading, Flex, Link,
  Image, Collapse, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  useColorMode } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { publicationVenueColors } from '@/config/theme'
import type { Publication } from '@/types'
import { sortPublications } from '@/utils/publicationOrder'
import DynamicIcon from '../DynamicIcon'
import SectionMoreLink from '../SectionMoreLink'

const HOME_PUBLICATION_LIMIT = 3

const PubLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
  <Link href={href} isExternal _hover={{ textDecoration: 'none' }}>
    <HStack
      spacing={1.5} px={2.5} py={1} borderRadius="8px" border="1px solid"
      borderColor="var(--border-color)"
      color="textSecondary"
      fontSize="xs" fontFamily="mono"
      transition="border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
      _hover={{ borderColor: 'accent', color: 'accent', transform: 'translateY(-1px)' }}
    >
      <DynamicIcon name={icon} boxSize={3} />
      <Text>{label}</Text>
    </HStack>
  </Link>
)

const AWARD_BADGES = ['Best Paper', 'Oral', 'Spotlight']
const FIRST_AUTHOR_BADGES = ['First Author', 'Co-First']

const PublicationCard = ({ pub }: { pub: Publication }) => {
  const { t } = useTranslation()
  const { siteOwner } = useLocalizedData()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { isOpen: isAbstractOpen, onToggle: onToggleAbstract } = useDisclosure()
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure()
  const authorVariants = siteOwner.name.authorVariants as readonly string[]
  const venueTheme = pub.venueType ? publicationVenueColors[pub.venueType] : undefined
  // Warm-gold treatment for award mentions (derived from the `warm` token colors)
  const warmBg = isDark ? 'rgba(235, 203, 139, 0.14)' : 'rgba(163, 123, 44, 0.1)'
  const warmBorder = isDark ? 'rgba(235, 203, 139, 0.35)' : 'rgba(163, 123, 44, 0.3)'

  return (
    <Box
      p={[4, 5, 6]}
      bg="var(--card-bg)"
      border="1px solid"
      borderColor="var(--border-color)"
      borderLeftWidth="2px"
      borderLeftColor="accent"
      borderRadius="12px"
      boxShadow="var(--shadow-sm)"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{ transform: 'translateY(-2px)', borderColor: 'var(--border-strong)', borderLeftColor: 'accent', boxShadow: 'var(--shadow-lift)' }}
    >
      <Flex direction={["column", "column", "row"]} gap={[4, 4, 6]} align="stretch">
        {pub.featuredImage && (
          <Box flexShrink={0} w={["full", "full", "300px"]} minH={["200px", "220px", "auto"]}
            role="button" tabIndex={0} onClick={onImageOpen}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onImageOpen() } }}
            cursor="zoom-in" overflow="hidden" borderRadius="8px" border="1px solid" borderColor="var(--border-color)"
          >
            <Image src={pub.featuredImage} alt={pub.title} w="full" h="full" objectFit="contain" bg="var(--card-bg)" p={1} transition="transform 0.3s ease" _hover={{ transform: 'scale(1.03)' }} />
          </Box>
        )}
        <VStack align="start" spacing={2.5} flex={1} justify="center">
          <HStack spacing={2} flexWrap="wrap" align="center">
            <Text
              fontSize="2xs" fontFamily="mono" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase"
              px={2} py={0.5} borderRadius="6px"
              bg={venueTheme ? venueTheme.bg(isDark) : 'accentSubtle'}
              color={venueTheme ? venueTheme.fg(isDark) : 'accent'}
            >
              {pub.venue && String(pub.year) && pub.venue.includes(String(pub.year)) ? pub.venue : `${pub.venue} ${pub.year}`}
            </Text>
            {pub.venueType && <Text fontSize="2xs" color="textMuted" fontFamily="mono" letterSpacing="0.04em">/ {pub.venueType}</Text>}
          </HStack>
          <Heading as="h3" fontFamily="body" fontSize={["md", "md", "lg"]} lineHeight="1.5" fontWeight="600" letterSpacing="normal" color="textPrimary">{pub.title}</Heading>
          <VStack align="start" spacing={1.5} w="full">
            <Text fontSize="sm" color="textSecondary" lineHeight="base" noOfLines={2}>
              {pub.authors.map((author: string, idx: number) => {
                const cleanAuthor = author.replace('*', '')
                const hasAsterisk = author.includes('*')
                const isSelfAuthor = authorVariants.includes(cleanAuthor)
                const isCoFirstAuthor = pub.isCoFirst && pub.coFirstAuthors?.includes(cleanAuthor)
                return (
                  <Text
                    as="span"
                    key={idx}
                    fontWeight={isSelfAuthor ? '600' : isCoFirstAuthor ? '500' : 'normal'}
                    color={isSelfAuthor ? 'accent' : isCoFirstAuthor ? 'textPrimary' : undefined}
                  >
                    {cleanAuthor}{(isCoFirstAuthor || hasAsterisk) && <Text as="sup" fontSize="2xs" color="accent">*</Text>}{idx < pub.authors.length - 1 && ', '}
                  </Text>
                )
              })}
            </Text>
            {pub.specialBadges && pub.specialBadges.length > 0 && (
              <HStack spacing={1.5} flexWrap="wrap">
                {pub.specialBadges.map((badge: string) => {
                  const isAward = AWARD_BADGES.includes(badge)
                  const isFirstAuthorBadge = FIRST_AUTHOR_BADGES.includes(badge)
                  return (
                    <Text key={badge} fontSize="2xs" fontFamily="mono" letterSpacing="0.04em" px={2} py={0.5} borderRadius="6px" border="1px solid"
                      borderColor={isAward ? warmBorder : isFirstAuthorBadge ? 'accentSubtle' : 'var(--border-color)'}
                      color={isAward ? 'warm' : isFirstAuthorBadge ? 'accent' : 'textMuted'}
                      bg={isAward ? warmBg : isFirstAuthorBadge ? 'accentSubtle' : 'transparent'}
                    >{badge === 'Best Paper' ? `🏆 ${badge}` : badge}</Text>
                  )
                })}
                {pub.isCoFirst && <Text fontSize="2xs" color="textMuted" fontStyle="italic">{t('about.equalContribution')}</Text>}
              </HStack>
            )}
          </VStack>
          <Box w="full" h="1px" bg="var(--border-color)" />
          <HStack spacing={1.5} flexWrap="wrap">
            {pub.links.paper && <PubLink href={pub.links.paper} icon="FaFileAlt" label={t('about.paper')} />}
            {pub.links.arxiv && <PubLink href={pub.links.arxiv} icon="SiArxiv" label={t('about.arXiv')} />}
            {pub.links.projectPage && <PubLink href={pub.links.projectPage} icon="FaGlobe" label={t('about.project')} />}
            {pub.links.code && <PubLink href={pub.links.code} icon="FaGithub" label={t('about.code')} />}
            {pub.links.demo && <PubLink href={pub.links.demo} icon="FaPlay" label={t('about.demo')} />}
            {pub.links.dataset && <PubLink href={pub.links.dataset} icon="FaDatabase" label={t('about.dataset')} />}
            {pub.abstract && (
              <HStack as="button" spacing={1.5} px={2.5} py={1} borderRadius="8px" border="1px solid"
                borderColor={isAbstractOpen ? 'accent' : 'var(--border-color)'}
                color={isAbstractOpen ? 'accent' : 'textSecondary'}
                fontSize="xs" fontFamily="mono"
                transition="border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
                _hover={{ borderColor: 'accent', color: 'accent', transform: 'translateY(-1px)' }}
                onClick={onToggleAbstract}
              >
                <DynamicIcon name="FaChevronRight" boxSize={2.5} style={{ transform: isAbstractOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                <Text>{t('about.abstract')}</Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </Flex>
      {pub.abstract && (
        <Collapse in={isAbstractOpen} animateOpacity>
          <Box mt={4} p={4} bg="var(--bg-color)" borderRadius="8px" borderLeft="2px solid" borderLeftColor="accent">
            <Text fontSize={["xs", "sm"]} lineHeight="tall" color="textSecondary">{pub.abstract}</Text>
            {pub.keywords && (
              <HStack mt={3} spacing={1.5} flexWrap="wrap">
                {pub.keywords.map((keyword: string) => (
                  <Text key={keyword} fontSize="2xs" fontFamily="mono" color="textMuted" px={2} py={0.5} bg="var(--hover-color)" borderRadius="6px">{keyword}</Text>
                ))}
              </HStack>
            )}
          </Box>
        </Collapse>
      )}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color={isDark ? 'gray.200' : 'gray.700'} />
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
            <Image src={pub.featuredImage} alt={`${pub.title} large preview`} maxH="80vh" maxW="90vw" objectFit="contain" borderRadius="12px" bg={isDark ? 'gray.900' : 'white'} p={4} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

const SelectedPublicationsSection: React.FC = () => {
  const { t } = useTranslation()
  const { publications } = useLocalizedData()

  const selectedPubs = useMemo(
    () => sortPublications(publications, 'newest').slice(0, HOME_PUBLICATION_LIMIT),
    [publications]
  )

  if (selectedPubs.length === 0) return null

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.selectedPublications')}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        <VStack spacing={[4, 5, 6]} align="stretch">
          {selectedPubs.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </VStack>
        <SectionMoreLink to="/publications">{t('about.viewAllPublications')}</SectionMoreLink>
      </Container>
    </Box>
  )
}

export default SelectedPublicationsSection
