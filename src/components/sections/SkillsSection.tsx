import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  useColorModeValue,
  usePrefersReducedMotion,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import type { Skill, SkillEvidence } from '@/types'
import DynamicIcon from '../DynamicIcon'

type SkillItem = string | Skill

const SkillsSection: React.FC = () => {
  const { t } = useTranslation()
  const { siteOwner, experienceTimeline, projects, publications } = useLocalizedData()
  const [openSkillId, setOpenSkillId] = useState<string | null>(null)
  const skills = (siteOwner.skills ?? []) as readonly SkillItem[]
  const prefersReducedMotion = usePrefersReducedMotion()
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.82)', 'rgba(25, 24, 32, 0.84)')
  const glassBorder = useColorModeValue('rgba(74, 85, 104, 0.18)', 'rgba(255, 255, 255, 0.14)')
  const evidenceBg = useColorModeValue('rgba(255, 255, 255, 0.48)', 'rgba(255, 255, 255, 0.055)')

  if (skills.length === 0) return null

  const getId = (s: SkillItem) => typeof s === 'string' ? s : s.id
  const getName = (s: SkillItem) => typeof s === 'string' ? s : s.name
  const getIcon = (s: SkillItem) => typeof s === 'string' ? undefined : s.icon
  const getDescription = (s: SkillItem) => typeof s === 'string' ? undefined : s.description
  const getEvidence = (s: SkillItem) => typeof s === 'string' ? [] : (s.evidence ?? []).slice(0, 2)

  const resolveEvidence = (evidence: SkillEvidence) => {
    if (evidence.kind === 'experience') {
      const item = experienceTimeline.find(entry => entry.id === evidence.ref)
      return {
        label: item?.company ?? evidence.ref,
        url: item?.companyUrl,
        note: evidence.note,
        kind: evidence.kind,
      }
    }
    if (evidence.kind === 'project') {
      const item = projects.find(project => project.id === evidence.ref)
      return {
        label: item?.title ?? evidence.ref,
        url: item?.link,
        note: evidence.note,
        kind: evidence.kind,
      }
    }
    const item = publications.find(publication => publication.id === evidence.ref)
    return {
      label: item?.title ?? evidence.ref,
      url: item?.links.projectPage ?? item?.links.paper ?? item?.links.arxiv,
      note: evidence.note,
      kind: evidence.kind,
    }
  }

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.skills', 'Skills')}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        <Flex gap={2.5} flexWrap="wrap" align="center">
          {skills.map((skill) => {
            const id = getId(skill)
            const name = getName(skill)
            const icon = getIcon(skill)
            const description = getDescription(skill)
            const evidence = getEvidence(skill).map(resolveEvidence)
            const hasDetails = Boolean(description || evidence.length)
            const isExpanded = openSkillId === id

            if (!hasDetails) {
              return (
                <HStack
                  key={id}
                  spacing={2}
                  px={3}
                  py={2}
                  bg="var(--card-bg)"
                  border="1px solid"
                  borderColor="var(--border-color)"
                  borderRadius="8px"
                  boxShadow="var(--shadow-sm)"
                  transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease"
                  _hover={{ transform: 'translateY(-1px)', borderColor: 'var(--accent-color)', boxShadow: 'var(--shadow-lift)' }}
                >
                  {icon && (
                    <DynamicIcon name={icon} boxSize={3} color="textMuted" flexShrink={0} />
                  )}
                  <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="textPrimary" lineHeight="1.4">{name}</Text>
                </HStack>
              )
            }

            return (
              <Popover
                key={id}
                isOpen={isExpanded}
                onOpen={() => setOpenSkillId(id)}
                onClose={() => setOpenSkillId(null)}
                trigger="click"
                placement="auto"
                strategy="fixed"
                gutter={10}
                isLazy
                closeOnBlur
                closeOnEsc
                autoFocus={false}
              >
                <PopoverTrigger>
                  <HStack
                    as="button"
                    type="button"
                    w={["full", "auto"]}
                    justify="space-between"
                    spacing={2}
                    px={3}
                    py={2}
                    bg={isExpanded ? 'var(--elevated-bg)' : 'var(--card-bg)'}
                    border="1px solid"
                    borderColor={isExpanded ? 'var(--accent-color)' : 'var(--border-color)'}
                    borderRadius="8px"
                    boxShadow={isExpanded ? 'var(--glow-accent)' : 'var(--shadow-sm)'}
                    cursor="pointer"
                    textAlign="left"
                    transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease, background-color .2s ease"
                    _hover={{ transform: 'translateY(-1px)', borderColor: 'var(--accent-color)', boxShadow: 'var(--glow-accent)' }}
                  >
                    <HStack spacing={2} minW={0}>
                      {icon && (
                        <DynamicIcon name={icon} boxSize={3} color="textMuted" flexShrink={0} />
                      )}
                      <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="textPrimary" lineHeight="1.4">
                        {name}
                      </Text>
                    </HStack>
                    <DynamicIcon
                      name="FaChevronRight"
                      boxSize={2.5}
                      color="textMuted"
                      flexShrink={0}
                      transition="transform 0.18s ease"
                      transform={isExpanded ? 'rotate(90deg)' : undefined}
                    />
                  </HStack>
                </PopoverTrigger>

                <Portal>
                  <PopoverContent
                    w={["calc(100vw - 24px)", "380px"]}
                    maxW="calc(100vw - 24px)"
                    bg={glassBg}
                    border="1px solid"
                    borderColor={glassBorder}
                    borderRadius="14px"
                    boxShadow="0 20px 55px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.12)"
                    zIndex={1500}
                    motionProps={prefersReducedMotion ? {
                      transition: { duration: 0 },
                    } : {
                      initial: { opacity: 0, scale: 0.96, y: -4 },
                      animate: { opacity: 1, scale: 1, y: 0 },
                      exit: { opacity: 0, scale: 0.98, y: -2 },
                      transition: { duration: 0.18, ease: 'easeOut' },
                    }}
                    sx={{
                      backdropFilter: 'blur(18px) saturate(145%)',
                      WebkitBackdropFilter: 'blur(18px) saturate(145%)',
                    }}
                    _focus={{ outline: 'none', boxShadow: '0 20px 55px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--accent-color)' }}
                  >
                    <PopoverArrow bg={glassBg} />
                    <PopoverHeader px={4} pt={3.5} pb={2} border="0">
                      <HStack spacing={2.5}>
                        {icon && <DynamicIcon name={icon} boxSize={3.5} color="accent" flexShrink={0} />}
                        <Text fontFamily="mono" fontSize="sm" fontWeight="bold" color="textPrimary">
                          {name}
                        </Text>
                      </HStack>
                    </PopoverHeader>
                    <PopoverBody px={4} pt={0} pb={4}>
                      {description && (
                        <Text fontSize="sm" lineHeight="1.7" color="textSecondary">
                          {description}
                        </Text>
                      )}

                      {evidence.length > 0 && (
                        <Box mt={3.5}>
                          <Text
                            mb={2}
                            fontFamily="mono"
                            fontSize="2xs"
                            fontWeight="bold"
                            letterSpacing="0.08em"
                            textTransform="uppercase"
                            color="textMuted"
                          >
                            {t('about.skillEvidence')}
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {evidence.map((item) => {
                              const content = (
                                <Box
                                  px={3}
                                  py={2.5}
                                  bg={evidenceBg}
                                  border="1px solid"
                                  borderColor={glassBorder}
                                  borderRadius="10px"
                                  transition="transform .18s ease, border-color .18s ease, background-color .18s ease"
                                  _hover={item.url ? { transform: 'translateY(-1px)', borderColor: 'var(--accent-color)' } : undefined}
                                >
                                  <Flex align="center" justify="space-between" gap={3}>
                                    <Text fontSize="2xs" fontFamily="mono" color="accent" textTransform="uppercase" letterSpacing="0.06em">
                                      {t(`about.skillEvidenceKind.${item.kind}`)}
                                    </Text>
                                    {item.url && <DynamicIcon name="FaExternalLinkAlt" boxSize={2.5} color="textMuted" flexShrink={0} />}
                                  </Flex>
                                  <Text mt={0.5} fontSize="xs" fontWeight="semibold" color="textPrimary" lineHeight="1.45">
                                    {item.label}
                                  </Text>
                                  {item.note && (
                                    <Text mt={0.5} fontSize="xs" color="textSecondary" lineHeight="1.55" whiteSpace="pre-line">
                                      {item.note}
                                    </Text>
                                  )}
                                </Box>
                              )

                              return item.url ? (
                                <Link
                                  key={`${item.kind}-${item.label}`}
                                  href={item.url}
                                  isExternal
                                  display="block"
                                  _hover={{ textDecoration: 'none' }}
                                >
                                  {content}
                                </Link>
                              ) : (
                                <Box key={`${item.kind}-${item.label}`}>{content}</Box>
                              )
                            })}
                          </VStack>
                        </Box>
                      )}
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            )
          })}
        </Flex>
      </Container>
    </Box>
  )
}

export default SkillsSection
