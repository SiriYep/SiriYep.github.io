import React, { useState, useMemo } from 'react'
import {
  Box, Button, Collapse, Flex, Heading, HStack, IconButton, Input, Text, VStack,
  Link, useColorMode,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import {
  FaAngleDoubleDown,
  FaAngleDoubleUp,
  FaChevronDown,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import type {
  EngagementType,
  ExperienceCategory,
  ExperienceEntry,
  ExperienceRolePhase,
  PhasedExperienceEntry,
  RoleType,
} from '../types'
import { highlightSemanticTerms } from '../utils/highlightData'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { terminalPalette } from '@/config/theme'
import { withBase } from '@/utils/asset'
import InstitutionLogo from './InstitutionLogo'

/* ── Keyframes ─────────────────────────────────────────────────── */
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0}`

/* ── Types & config ────────────────────────────────────────────── */
const roleTypeConfig: Record<RoleType, { labelKey: string; color: (dk: boolean) => string }> = {
  research:   { labelKey: 'experience.roleResearch',   color: dk => dk ? '#b48ead' : '#9a56a2' },
  mle:        { labelKey: 'experience.roleMLE',        color: dk => dk ? '#88c0d0' : '#2a769c' },
  sde:        { labelKey: 'experience.roleSDE',        color: dk => dk ? '#d08770' : '#b35a2e' },
  teaching:   { labelKey: 'experience.roleTeaching',   color: dk => dk ? '#a3be8c' : '#34744e' },
  leadership: { labelKey: 'experience.roleLeadership', color: dk => dk ? '#ebcb8b' : '#c47d46' },
}

/* ── Logos helper ────────────────────────────────────────────── */
const getIconUrl = (url?: string, company?: string, logos?: Record<string, string>) => {
  if (company && logos?.[company]) return logos[company]
  if (url) {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` }
    catch { /* fall through */ }
  }
  return null
}

const resolveIconSrc = (src: string) => (
  src.startsWith('http://') || src.startsWith('https://') ? src : withBase(src)
)

/* ── Helpers ────────────────────────────────────────────────────── */
// fmtDate is called inside the component where t() is available
const fmtDateFn = (v: string | undefined, presentLabel: string, lang: string) => {
  if (!v) return presentLabel
  if (v.toLowerCase() === 'present') return presentLabel
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', year: 'numeric' })
}

const isOngoing = (end?: string) => !end || end.toLowerCase() === 'present'

const hasRolePhases = (entry: ExperienceEntry): entry is PhasedExperienceEntry => (
  Array.isArray(entry.roles) && entry.roles.length > 0
)

interface NormalizedExperience {
  id: string
  company: string
  companyUrl?: string
  location?: string
  category: ExperienceCategory
  summary?: string
  highlights: string[]
  emphasis: string[]
  phases: ExperienceRolePhase[]
  timelineAnchorPhase: ExperienceRolePhase
  transitionPhase?: ExperienceRolePhase
  currentPhase?: ExperienceRolePhase
  isAnchorCurrent: boolean
  isRelationshipCurrent: boolean
  roleType: RoleType
}

type TimelineOrder = 'newest' | 'oldest'

const normalizeExperience = (entry: ExperienceEntry): NormalizedExperience => {
  const phases = (hasRolePhases(entry)
    ? [...entry.roles]
    : [{
        id: 'primary-role',
        title: entry.title,
        engagementType: 'employment' as EngagementType,
        start: entry.start,
        end: entry.end,
        roleType: entry.roleType,
      }]
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const timelineAnchorPhase = hasRolePhases(entry)
    ? phases.find(phase => phase.id === entry.timelineAnchorRoleId)
      ?? phases.find(phase => phase.engagementType === 'internship')
      ?? phases[0]
    : phases[0]
  const transitionPhase = phases.find(phase => (
    phase.engagementType === 'collaboration'
    && new Date(phase.start).getTime() >= new Date(timelineAnchorPhase.start).getTime()
  ))
  const currentPhase = phases.find(phase => isOngoing(phase.end))
  const roleType = currentPhase?.roleType
    ?? phases.at(-1)?.roleType
    ?? (!hasRolePhases(entry) ? entry.roleType : undefined)
    ?? (entry.category === 'industry' ? 'sde' : 'research')

  return {
    id: entry.id,
    company: entry.company,
    companyUrl: entry.companyUrl,
    location: entry.location,
    category: entry.category,
    summary: entry.summary,
    highlights: entry.highlights ?? [],
    emphasis: entry.emphasis ?? [],
    phases,
    timelineAnchorPhase,
    transitionPhase,
    currentPhase,
    isAnchorCurrent: isOngoing(timelineAnchorPhase.end),
    isRelationshipCurrent: Boolean(currentPhase),
    roleType,
  }
}

/* ── Component ─────────────────────────────────────────────────── */
const Experience: React.FC = () => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { t, i18n } = useTranslation()
  const { experienceTimeline, experience: experienceData, institutionLogos, siteOwner } = useLocalizedData()
  const fmtDate = (v?: string) => fmtDateFn(v, t('experience.present'), i18n.language)

  const [timelineOrder, setTimelineOrder] = useState<TimelineOrder>('newest')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [command, setCommand] = useState('')
  const [cmdOutput, setCmdOutput] = useState<string[]>([])

  /* Palette (centralized) */
  const tc = terminalPalette.colors(isDark)
  const bg = isDark ? 'gray.900' : 'gray.50'
  const termBg = tc.bg
  const termText = tc.text
  const termHeader = tc.header
  const termBorder = tc.border
  const termPrompt = tc.prompt
  const termCommand = tc.command
  const termInfo = tc.info
  const termHighlight = tc.highlight
  const termSuccess = tc.success
  const termSecondary = tc.secondary

  /* ── Data ──────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    const chronological = experienceTimeline
      .map(normalizeExperience)
      .sort((a, b) => (
        new Date(a.timelineAnchorPhase.start).getTime()
        - new Date(b.timelineAnchorPhase.start).getTime()
        || a.id.localeCompare(b.id)
      ))

    return timelineOrder === 'newest' ? chronological.reverse() : chronological
  }, [experienceTimeline, timelineOrder])

  const stats = useMemo(() => {
    const organizations = new Set(sorted.map(e => e.company)).size
    const currentInternships = sorted.filter(
      entry => entry.currentPhase?.engagementType === 'internship',
    ).length
    const activeCollaborations = sorted.filter(
      entry => entry.currentPhase?.engagementType === 'collaboration',
    ).length
    return { total: sorted.length, organizations, currentInternships, activeCollaborations }
  }, [sorted])
  const usesEngagementTimeline = useMemo(
    () => sorted.some(entry => entry.timelineAnchorPhase.engagementType !== 'internship'),
    [sorted],
  )
  const summaryKey = stats.currentInternships === 0
    ? 'experience.summaryWithoutCurrentInternships'
    : 'experience.summary'

  const education = experienceData.education.courses
  const reviewingItems = useMemo(() => experienceData.reviewing ?? [], [experienceData.reviewing])
  const reviewingByYear = useMemo(() => {
    const groups: Record<string, typeof reviewingItems> = {}
    for (const item of reviewingItems) {
      const m = item.venue.match(/\b(20\d{2})\b/)
      const y = m ? m[1] : 'Other'
      if (!groups[y]) groups[y] = []
      groups[y].push(item)
    }
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a))
  }, [reviewingItems])

  const detailIds = useMemo(
    () => sorted
      .filter(entry => Boolean(entry.summary?.trim() || entry.highlights.length))
      .map(entry => entry.id),
    [sorted],
  )
  const allDetailsExpanded = detailIds.length > 0
    && detailIds.every(id => expandedItems[id] ?? true)

  const toggleExpanded = (id: string) =>
    setExpandedItems(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))

  const toggleAllDetails = () => {
    const nextExpanded = !allDetailsExpanded
    setExpandedItems(prev => ({
      ...prev,
      ...Object.fromEntries(detailIds.map(id => [id, nextExpanded])),
    }))
  }

  /* ── Command handler ───────────────────────────────────────── */
  const handleCommand = (cmd: string) => {
    const raw = cmd.trim()
    if (!raw) return
    const parts = raw.toLowerCase().split(' ')
    const out = (lines: string[]) => setCmdOutput(lines)
    switch (parts[0]) {
      case 'clear': setCmdOutput([]); break
      case 'whoami': out([siteOwner.name.full, 'researcher · ml engineer · builder']); break
      case 'help': out([
        'clear  whoami',
        'sudo hire-me  cat skills',
      ]); break
      case 'sudo':
        if (parts.slice(1).join(' ') === 'hire-me')
          out(['initiating hire sequence...', `Email: ${siteOwner.contact.hiringEmail}`, 'Status: Open to opportunities!'])
        else out([`sudo: ${parts.slice(1).join(' ')}: permission denied`])
        break
      case 'cat':
        if (parts[1] === 'skills') out([
          siteOwner.skills.join(' · '),
        ])
        else out([`cat: ${parts[1] || ''}: not found`])
        break
      default: out([`bash: ${parts[0]}: command not found`])
    }
    setCommand('')
  }

  const termParam = tc.param

  return (
    <Box w="full" minH="100vh" bg={bg} py={[8, 10, 12]}>
      <VStack spacing={5} maxW="1400px" mx="auto" px={[3, 4, 6]}>

        {/* ── Section header ────────────────────────────────── */}
        <Flex w="full" align="center" gap={3}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">
            {t('experience.pageTitle')}
          </Heading>
          <Text
            as="span"
            fontFamily="mono"
            fontSize="2xs"
            fontWeight="600"
            px={2} py={0.5}
            borderRadius="full"
            bg="accentSubtle"
            color="accent"
            letterSpacing="0.05em"
          >
            {stats.total}
          </Text>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>

        {/* ── Terminal container ────────────────────────────── */}
        <Box
          w="full"
          borderRadius="12px"
          fontFamily="mono"
          border="1px solid"
          borderColor={termBorder}
          boxShadow="var(--shadow-card)"
          overflow="hidden"
        >
          {/* ═══ Pixel RGB light bar (thin & quiet) ═══ */}
          <Flex h="2px" w="full" overflow="hidden">
            {(() => {
              const total = 28
              const tick = Math.floor(Date.now() / 200)
              return Array.from({ length: total }, (_, i) => {
                const colorIdx = (i + tick) % terminalPalette.rainbow.length
                const brightness = 0.6 + 0.4 * Math.abs(Math.sin((i + tick * 0.5) * 0.3))
                return <Box key={i} flex={1} h="full" bg={terminalPalette.rainbow[colorIdx]} opacity={brightness * 0.75} />
              })
            })()}
          </Flex>

          {/* ═══ Title bar ═══ */}
          <Flex
            bg={termHeader} px={4} py={2}
            borderBottom={`1px solid ${termBorder}`}
            justify="space-between" align="center"
            fontSize="xs" fontWeight="medium"
          >
            <HStack spacing={3}>
              <HStack spacing={1.5}>
                <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" opacity={0.9} />
                <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" opacity={0.9} />
                <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" opacity={0.9} />
              </HStack>
              <Text>
                <Box as="span" color={termParam}>const </Box>
                <Box as="span" color={termPrompt} fontWeight="bold">career</Box>
                <Box as="span" color={termSecondary}> = </Box>
                <Box as="span" color={termParam}>new </Box>
                <Box as="span" color={termCommand} fontWeight="bold">Explorer</Box>
                <Box as="span" color={termSecondary}>(</Box>
                <Box as="span" color={termHighlight}>'experience'</Box>
                <Box as="span" color={termSecondary}>)</Box>
              </Text>
            </HStack>
            <Text color={termSecondary} fontSize="2xs">
              {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </Flex>

          {/* ═══ Touch bar ═══ */}
          <Flex
            bg={tc.touchBar}
            px={4} py={1}
            borderBottom={`1px solid ${termBorder}`}
            fontSize="2xs" align="center"
            justify="space-between" overflow="hidden"
          >
            <Text color={termSecondary} isTruncated>
              <Text as="span" color={termPrompt} fontWeight="bold">{siteOwner.terminalUsername}</Text>
              <Text as="span" color={tc.muted}> · </Text>
              <Text as="span" color={termHighlight}>
                {t(summaryKey, stats)}
              </Text>
            </Text>
            <Text color={termCommand} flexShrink={0}>~/career</Text>
          </Flex>

          {/* Education */}
          <Box px={[3, 5]} py={3} bg={termBg} borderBottom={`1px solid ${termBorder}`}>
            <Flex align="center" gap={2} mb={2.5}>
              <Box w="12px" h="2px" borderRadius="full" bg={termCommand} />
              <Text fontSize="xs" fontWeight="bold" color={termInfo} letterSpacing="0.06em">{t('experience.education')}</Text>
              <Box flex="1" h="1px" bgGradient={`linear(to-r, ${termBorder}, transparent)`} />
            </Flex>
            <VStack align="stretch" spacing={1.5} pl={1}>
              {education.map(edu => {
                const logo = institutionLogos[edu.institution]
                return (
                  <HStack key={edu.course} fontSize="xs" spacing={2} align="center" minH="24px">
                    <InstitutionLogo
                      src={logo ? withBase(logo) : undefined}
                      label={edu.institution}
                      fallback={edu.institution.charAt(0)}
                      size="xs"
                    />
                    <Flex flex="1" minW={0} align="center" gap={2} flexWrap={['wrap', 'nowrap']}>
                      <Text color={termText} fontWeight="medium" minW={0}>{edu.course}</Text>
                      <Text color={tc.muted} flexShrink={0}>·</Text>
                      <Text color={termCommand} minW={0}>{edu.institution}</Text>
                    </Flex>
                    <Text color={termSecondary} flexShrink={0}>{edu.year}</Text>
                  </HStack>
                )
              })}
            </VStack>
          </Box>

          {/* Unified experience timeline label */}
          <Box
            px={[3, 5]} py={2}
            bg={termBg}
            borderBottom={`1px solid ${termBorder}`}
          >
            <Flex align="center" gap={2} flexWrap="wrap">
              <Flex align="center" gap={2} flex="1" minW={['100%', '180px']}>
                <Box w="12px" h="2px" borderRadius="full" bg={termHighlight} flexShrink={0} />
                <Text fontSize="xs" fontWeight="bold" color={termInfo} letterSpacing="0.06em" flexShrink={0}>
                  {t(usesEngagementTimeline ? 'experience.engagementTimeline' : 'experience.timeline')}
                </Text>
                <Box flex="1" h="1px" bgGradient={`linear(to-r, ${termBorder}, transparent)`} />
              </Flex>
              <HStack spacing={1} flexShrink={0} ml="auto">
                <Button
                  size="xs"
                  variant="ghost"
                  color={termSecondary}
                  fontFamily="mono"
                  fontSize="2xs"
                  fontWeight="semibold"
                  leftIcon={timelineOrder === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                  onClick={() => setTimelineOrder(current => current === 'newest' ? 'oldest' : 'newest')}
                  aria-controls="internship-timeline"
                  aria-label={t(timelineOrder === 'newest'
                    ? 'experience.orderNewestAria'
                    : 'experience.orderOldestAria')}
                  _hover={{ color: termText, bg: 'var(--hover-color)' }}
                >
                  {t(timelineOrder === 'newest' ? 'experience.newestFirst' : 'experience.oldestFirst')}
                </Button>
                {detailIds.length > 0 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color={termSecondary}
                    fontFamily="mono"
                    fontSize="2xs"
                    fontWeight="semibold"
                    leftIcon={allDetailsExpanded ? <FaAngleDoubleUp /> : <FaAngleDoubleDown />}
                    onClick={toggleAllDetails}
                    aria-expanded={allDetailsExpanded}
                    aria-controls={detailIds.map(id => `experience-details-${id}`).join(' ')}
                    _hover={{ color: termText, bg: 'var(--hover-color)' }}
                  >
                    {t(allDetailsExpanded ? 'experience.collapseAll' : 'experience.expandAll')}
                  </Button>
                )}
              </HStack>
            </Flex>
          </Box>

          {/* ── Internship timeline ───────────────────────── */}
          <Box bg={termBg} color={termText} px={[3, 5]} py={[4, 5]}>
            <Box
              as="ol"
              id="internship-timeline"
              listStyleType="none"
              m={0}
              p={0}
              aria-label={t(usesEngagementTimeline
                ? (timelineOrder === 'newest'
                    ? 'experience.engagementTimelineNewestAria'
                    : 'experience.engagementTimelineOldestAria')
                : (timelineOrder === 'newest'
                    ? 'experience.internshipTimelineNewestAria'
                    : 'experience.internshipTimelineOldestAria'))}
            >
              {sorted.map((exp, entryIndex) => {
                const id = exp.id
                const detailsId = `experience-details-${exp.id}`
                const isExpanded = expandedItems[id] ?? true
                const hasDetails = Boolean(exp.summary?.trim() || exp.highlights.length)
                const rtCfg = roleTypeConfig[exp.roleType]
                const rtColor = rtCfg.color(isDark)
                const icon = getIconUrl(exp.companyUrl, exp.company, institutionLogos)
                // The outer rail highlights the configured anchor relationship. A diamond
                // marks a later collaboration phase when the relationship changes form.
                const axisEnd = exp.timelineAnchorPhase.end
                const hasTransition = Boolean(exp.transitionPhase)
                const isNewestFirst = timelineOrder === 'newest'
                const endTextColor = hasTransition
                  ? termCommand
                  : exp.isAnchorCurrent
                    ? termSuccess
                    : termSecondary
                const endNodeColor = hasTransition
                  ? termCommand
                  : exp.isAnchorCurrent
                    ? termSuccess
                    : 'var(--border-strong)'
                const topDate = isNewestFirst ? axisEnd : exp.timelineAnchorPhase.start
                const bottomDate = isNewestFirst ? exp.timelineAnchorPhase.start : axisEnd
                const isLast = entryIndex === sorted.length - 1
                const currentStatusKey = exp.currentPhase?.engagementType === 'internship'
                  ? 'experience.currentInternship'
                  : exp.currentPhase?.engagementType === 'collaboration'
                    ? 'experience.activeCollaboration'
                    : null
                const railLabel = hasTransition
                  ? t('experience.timelineTransitionAria', {
                      organization: exp.company,
                      start: fmtDate(exp.timelineAnchorPhase.start),
                      internshipEnd: fmtDate(exp.timelineAnchorPhase.end),
                      transitionStart: fmtDate(exp.transitionPhase?.start),
                    })
                  : exp.timelineAnchorPhase.engagementType === 'collaboration'
                    ? t(exp.isAnchorCurrent
                        ? 'experience.timelineCurrentCollaborationAria'
                        : 'experience.timelineCompletedCollaborationAria', {
                        organization: exp.company,
                        start: fmtDate(exp.timelineAnchorPhase.start),
                        end: fmtDate(exp.timelineAnchorPhase.end),
                      })
                    : exp.isAnchorCurrent
                      ? t('experience.timelineCurrentAria', {
                          organization: exp.company,
                          start: fmtDate(exp.timelineAnchorPhase.start),
                        })
                      : t('experience.timelineCompletedAria', {
                          organization: exp.company,
                          start: fmtDate(exp.timelineAnchorPhase.start),
                          end: fmtDate(exp.timelineAnchorPhase.end),
                        })

                return (
                  <Box
                    as="li"
                    key={id}
                    data-experience-id={id}
                    data-axis-direction={timelineOrder}
                    display="grid"
                    gridTemplateColumns={['18px minmax(0, 1fr)', '18px minmax(0, 1fr)', '82px 20px minmax(0, 1fr)']}
                    columnGap={[2, 3, 3]}
                    position="relative"
                    mb={4}
                    _last={{ mb: 0 }}
                  >
                    {/* Exact dates; the rail is deliberately not proportional to duration. */}
                    <Box display={['none', 'none', 'block']} position="relative" minH="116px" aria-hidden="true">
                      <Text
                        data-axis-date={isNewestFirst ? 'end' : 'start'}
                        position="absolute"
                        top="9px"
                        right={0}
                        fontSize="2xs"
                        fontWeight={isNewestFirst && (hasTransition || exp.isAnchorCurrent) ? 'bold' : 'normal'}
                        color={isNewestFirst ? endTextColor : termSecondary}
                        whiteSpace="nowrap"
                      >
                        {fmtDate(topDate)}
                      </Text>
                      <Text
                        data-axis-date={isNewestFirst ? 'start' : 'end'}
                        position="absolute"
                        top="91px"
                        right={0}
                        fontSize="2xs"
                        fontWeight={!isNewestFirst && (hasTransition || exp.isAnchorCurrent) ? 'bold' : 'normal'}
                        color={isNewestFirst ? termSecondary : endTextColor}
                        whiteSpace="nowrap"
                      >
                        {fmtDate(bottomDate)}
                      </Text>
                    </Box>

                    {/* Solid segment = internship; dashed segment = list sequence only. */}
                    <Box position="relative" minH="116px" role="img" aria-label={railLabel}>
                      <Box
                        data-axis-line="internship"
                        aria-hidden="true"
                        position="absolute"
                        left="50%"
                        top="21px"
                        h="80px"
                        w="2px"
                        transform="translateX(-50%)"
                        bgGradient={`linear(to-b, ${isNewestFirst ? endTextColor : termHighlight}, ${isNewestFirst ? termHighlight : endTextColor})`}
                        opacity={0.7}
                      />
                      <Box
                        data-axis-point={isNewestFirst ? (hasTransition ? 'transition' : 'end') : 'start'}
                        aria-hidden="true"
                        position="absolute"
                        left="50%"
                        top="15px"
                        w="12px"
                        h="12px"
                        transform={isNewestFirst && hasTransition ? 'translateX(-50%) rotate(45deg)' : 'translateX(-50%)'}
                        borderRadius={isNewestFirst && hasTransition ? '2px' : 'full'}
                        bg={termBg}
                        border="2px solid"
                        borderColor={isNewestFirst ? endNodeColor : termHighlight}
                        boxShadow={isNewestFirst && exp.isAnchorCurrent ? `0 0 0 3px ${termSuccess}18` : 'none'}
                      />
                      <Box
                        data-axis-point={isNewestFirst ? 'start' : (hasTransition ? 'transition' : 'end')}
                        aria-hidden="true"
                        position="absolute"
                        left="50%"
                        top="95px"
                        w="12px"
                        h="12px"
                        transform={!isNewestFirst && hasTransition ? 'translateX(-50%) rotate(45deg)' : 'translateX(-50%)'}
                        borderRadius={!isNewestFirst && hasTransition ? '2px' : 'full'}
                        bg={termBg}
                        border="2px solid"
                        borderColor={isNewestFirst ? termHighlight : endNodeColor}
                        boxShadow={!isNewestFirst && exp.isAnchorCurrent ? `0 0 0 3px ${termSuccess}18` : 'none'}
                      />
                      {!isLast && (
                        <Box
                          aria-hidden="true"
                          position="absolute"
                          left="50%"
                          top="111px"
                          bottom="-20px"
                          transform="translateX(-50%)"
                          borderLeft="1px dashed"
                          borderColor="var(--border-color)"
                          opacity={0.65}
                        />
                      )}
                    </Box>

                    {/* One card per organization. */}
                    <Box
                      bg="var(--card-bg)"
                      border="1px solid"
                      borderColor="var(--border-color)"
                      borderRadius="12px"
                      boxShadow="var(--shadow-sm)"
                      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
                      _hover={{
                        transform: 'translateY(-2px)',
                        borderColor: 'var(--border-strong)',
                        boxShadow: 'var(--shadow-lift)',
                      }}
                    >
                      <Flex px={[3, 4]} py={[3, 4]} gap={3} align="start">
                        <InstitutionLogo
                          src={icon ? resolveIconSrc(icon) : undefined}
                          label={exp.company}
                          fallback={exp.company.charAt(0)}
                          size="md"
                        />

                        <Box flex="1" minW={0}>
                          <Text
                            display={['block', 'block', 'none']}
                            fontFamily="mono"
                            fontSize="2xs"
                            color={termSecondary}
                            mb={1}
                          >
                            {t(exp.timelineAnchorPhase.engagementType === 'collaboration'
                              ? 'experience.collaborationLabel'
                              : 'experience.internshipLabel')} · {fmtDate(exp.timelineAnchorPhase.start)} – {fmtDate(exp.timelineAnchorPhase.end)}
                          </Text>

                          <Flex align="center" gap={2} flexWrap="wrap" mb={0.5}>
                            {exp.companyUrl ? (
                              <Link
                                href={exp.companyUrl}
                                isExternal
                                fontFamily="body"
                                fontSize="md"
                                fontWeight="semibold"
                                color={termText}
                                lineHeight="1.35"
                                _hover={{ textDecoration: 'underline', color: 'accentStrong' }}
                              >
                                {exp.company}
                              </Link>
                            ) : (
                              <Text as="h3" fontFamily="body" fontSize="md" fontWeight="semibold" color={termText} lineHeight="1.35">
                                {exp.company}
                              </Text>
                            )}
                            <Text
                              fontSize="2xs"
                              fontWeight="bold"
                              color={rtColor}
                              letterSpacing="0.06em"
                              textTransform="uppercase"
                              px={1.5} py={0.5}
                              lineHeight="1.2"
                              borderRadius="6px"
                              bg={`${rtColor}18`}
                            >
                              {t(rtCfg.labelKey)}
                            </Text>
                            {currentStatusKey && exp.isRelationshipCurrent && (
                              <HStack spacing={1}>
                                <Box w="6px" h="6px" borderRadius="full" bg={termSuccess} flexShrink={0} />
                                <Text fontSize="2xs" color={termSuccess} fontWeight="semibold">
                                  {t(currentStatusKey)}
                                </Text>
                              </HStack>
                            )}
                          </Flex>

                          {/* Role history stays inside the organization card. */}
                          <Box as="ol" listStyleType="none" m={0} p={0} mt={2} aria-label={t('experience.roleHistoryAria', { organization: exp.company })}>
                            {exp.phases.map((phase, phaseIndex) => (
                              <React.Fragment key={phase.id}>
                                {phaseIndex > 0 && phase.engagementType === 'collaboration' && (
                                  <HStack spacing={1.5} pl={2} py={1} color={termSecondary} aria-hidden="true">
                                    <Text fontSize="xs">↳</Text>
                                    <Text fontFamily="mono" fontSize="2xs" letterSpacing="0.04em">
                                      {t('experience.continuedAs')}
                                    </Text>
                                  </HStack>
                                )}
                                <Flex
                                  as="li"
                                  align={['start', 'center']}
                                  justify="space-between"
                                  gap={[1, 3]}
                                  direction={['column', 'row']}
                                >
                                  <HStack spacing={1.5} minW={0}>
                                    {isOngoing(phase.end) && (
                                      <Box w="5px" h="5px" borderRadius="full" bg={termSuccess} flexShrink={0} />
                                    )}
                                    <Text as="h4" fontFamily="body" fontSize="sm" color="accent" fontWeight="medium">
                                      {phase.title}
                                    </Text>
                                  </HStack>
                                  <Text fontFamily="mono" fontSize="xs" color="textMuted" flexShrink={0}>
                                    {fmtDate(phase.start)} – {fmtDate(phase.end)}
                                  </Text>
                                </Flex>
                              </React.Fragment>
                            ))}
                          </Box>

                          {exp.location && (
                            <Text fontFamily="mono" fontSize="xs" color="textMuted" mt={1.5}>
                              {exp.location}
                            </Text>
                          )}
                        </Box>

                        {hasDetails && (
                          <IconButton
                            aria-label={t(isExpanded ? 'experience.collapseDetails' : 'experience.expandDetails', { organization: exp.company })}
                            aria-expanded={isExpanded}
                            aria-controls={detailsId}
                            icon={<FaChevronDown />}
                            size="xs"
                            variant="ghost"
                            color="textMuted"
                            flexShrink={0}
                            onClick={() => toggleExpanded(id)}
                            transform={isExpanded ? 'rotate(180deg)' : 'rotate(0)'}
                            transition="transform 0.2s ease"
                          />
                        )}
                      </Flex>

                      {hasDetails && (
                        <Collapse in={isExpanded}>
                          <Box id={detailsId} pl={[3, '68px']} pr={[3, 4]} pb={[3, 4]}>
                            <Box pl={3} borderLeft={`2px solid ${rtColor}`}>
                              {exp.summary && (
                                <Text fontFamily="body" fontSize="sm" color="textSecondary" mb={2} lineHeight="1.7">
                                  {highlightSemanticTerms(exp.summary, exp.emphasis, termCommand)}
                                </Text>
                              )}
                              <VStack align="stretch" spacing={1.5}>
                                {exp.highlights.map((line: string, i: number) => (
                                  <HStack key={i} fontSize="sm" align="start" spacing={2}>
                                    <Text color={rtColor} flexShrink={0} mt="1px">·</Text>
                                    <Text fontFamily="body" fontSize="sm" color={termText} lineHeight="1.6">
                                      {highlightSemanticTerms(line, exp.emphasis, termCommand)}
                                    </Text>
                                  </HStack>
                                ))}
                              </VStack>
                            </Box>
                          </Box>
                        </Collapse>
                      )}
                    </Box>
                  </Box>
                )
              })}

              {sorted.length === 0 && (
                <Box py={8} textAlign="center">
                  <Text color={termSecondary} fontSize="sm" fontFamily="body">{t('experience.noPositions')}</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Academic Reviewing */}
          {reviewingItems.length > 0 && (
            <Box px={[3, 5]} py={4} bg={termBg} borderTop={`1px solid ${termBorder}`}>
              <Flex align="center" gap={2} mb={3}>
                <Box w="12px" h="2px" borderRadius="full" bg={tc.param} />
                <Text fontSize="xs" fontWeight="bold" color={termInfo} letterSpacing="0.06em">{t('experience.academicReviewing')}</Text>
                <Text fontSize="2xs" color={tc.muted}>{reviewingItems.length}</Text>
                <Box flex="1" h="1px" bgGradient={`linear(to-r, ${termBorder}, transparent)`} />
              </Flex>
              <VStack align="stretch" spacing={2}>
                {reviewingByYear.map(([year, items]) => (
                  <HStack key={year} spacing={3} align="start" flexWrap="wrap">
                    <Text fontSize="xs" fontWeight="bold" color={termHighlight} w="35px" flexShrink={0}>
                      {year}
                    </Text>
                    <HStack spacing={1.5} flexWrap="wrap">
                      {items.map((item, idx) => (
                        <Text
                          key={`${item.venue}-${idx}`}
                          px={2} py={0.5}
                          fontSize="2xs"
                          letterSpacing="0.03em"
                          borderRadius="full"
                          bg="accentSubtle"
                          color="accent"
                        >
                          {item.venue.replace(/\s*\d{4}\s*/, ' ').trim()}
                        </Text>
                      ))}
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Command output */}
          {cmdOutput.length > 0 && (
            <Box
              px={[3, 5]} py={2}
              bg={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'}
              borderTop={`1px solid ${termBorder}`}
              aria-live="polite"
            >
              {cmdOutput.map((line, i) => (
                <Text key={i} fontSize="xs" fontFamily="mono" color={termText} whiteSpace="pre-wrap">{line}</Text>
              ))}
            </Box>
          )}

          {/* Command line */}
          <Flex
            px={[3, 5]} py={2}
            bg={termHeader}
            borderTop={`1px solid ${termBorder}`}
            align="center" fontSize="xs"
          >
            <Text color={termPrompt} mr={2} fontFamily="mono" flexShrink={0}>$</Text>
            <Input
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCommand(command) }}
              placeholder={t('experience.typeHelp')}
              aria-label={t('experience.commandInputLabel')}
              size="xs"
              variant="unstyled"
              color={termText}
              fontFamily="mono"
              flex="1"
            />
            <Box
              h="12px" w="6px" bg={termPrompt} ml={1}
              aria-hidden="true"
              sx={{ animation: `${blink} 1s step-end infinite` }}
            />
          </Flex>
        </Box>

      </VStack>
    </Box>
  )
}

export default Experience
