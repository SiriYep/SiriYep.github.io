import React, { useState, useMemo } from 'react'
import {
  Box, Collapse, Flex, Heading, HStack, Icon, Input, Text, VStack,
  Image, Link, useColorMode,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FaChevronDown } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import type { RoleType } from '../types'
import { highlightData } from '../utils/highlightData'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { terminalPalette } from '@/config/theme'
import { withBase } from '@/utils/asset'

/* ── Keyframes ─────────────────────────────────────────────────── */
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0}`

/* ── Types & config ────────────────────────────────────────────── */
type FilterType = 'all' | 'academic' | 'industry'

const categoryFilter: Record<string, FilterType> = {
  academic: 'academic', research: 'academic',
  industry: 'industry', leadership: 'academic',
}

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

/* ── Component ─────────────────────────────────────────────────── */
const Experience: React.FC = () => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { t, i18n } = useTranslation()
  const { experienceTimeline, experience: experienceData, institutionLogos, siteOwner } = useLocalizedData()
  const fmtDate = (v?: string) => fmtDateFn(v, t('experience.present'), i18n.language)

  const [filter, setFilter] = useState<FilterType>('all')
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
  const hoverBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
  const hlc = { num: termHighlight, kw: termCommand, str: termSuccess }

  /* ── Data ──────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    return experienceTimeline
      .map(e => ({ ...e, isCurrent: !e.end || e.end.toLowerCase() === 'present' }))
      .sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      })
  }, [experienceTimeline])

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted
    return sorted.filter(e => categoryFilter[e.category] === filter)
  }, [sorted, filter])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const key = e.isCurrent ? 'Present' : new Date(e.end!).getFullYear().toString()
      const list = map.get(key) ?? []
      list.push(e)
      map.set(key, list)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === 'Present') return -1
        if (b === 'Present') return 1
        return Number(b) - Number(a)
      })
      .map(([year, items]) => ({
        year,
        items: items.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()),
      }))
  }, [filtered])

  const stats = useMemo(() => {
    const current = sorted.filter(e => e.isCurrent).length
    const academic = sorted.filter(e => categoryFilter[e.category] === 'academic').length
    const industry = sorted.filter(e => categoryFilter[e.category] === 'industry').length
    return { total: sorted.length, current, academic, industry }
  }, [sorted])

  const education = experienceData.education.courses
  const reviewingItems = experienceData.reviewing ?? []
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

  const toggleExpanded = (id: string) =>
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))

  /* ── Command handler ───────────────────────────────────────── */
  const handleCommand = (cmd: string) => {
    const raw = cmd.trim()
    if (!raw) return
    const parts = raw.toLowerCase().split(' ')
    const out = (lines: string[]) => setCmdOutput(lines)
    switch (parts[0]) {
      case 'filter':
        if (parts[1] === 'academic' || parts[1] === 'industry') {
          setFilter(parts[1]); out([`filter: ${parts[1]}`])
        } else { setFilter('all'); out(['filter: all']) }
        break
      case 'clear': setFilter('all'); setCmdOutput([]); break
      case 'whoami': out([siteOwner.name.full, 'researcher · ml engineer · builder']); break
      case 'help': out([
        'filter [all|academic|industry]  clear  whoami',
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
  const termWarning = tc.warning

  return (
    <Box w="full" minH="100vh" bg={bg} py={[8, 10, 12]}>
      <VStack spacing={5} maxW="1400px" mx="auto" px={[3, 4, 6]}>

        {/* ── Section header ────────────────────────────────── */}
        <Flex w="full" align="center" gap={3}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">
            {t('nav.experience')}
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
              <Text as="span" color={termHighlight}>{stats.total}</Text>
              <Text as="span"> {t('experience.rolesAcross')} </Text>
              <Text as="span" color={termSuccess}>{stats.current} {t('experience.currentlyActive')}</Text>
              <Text as="span" color={tc.muted}> · </Text>
              <Text as="span" color={termParam}>{stats.academic} {t('experience.research')}</Text>
              <Text as="span">, </Text>
              <Text as="span" color={termWarning}>{stats.industry} {t('experience.industry')}</Text>
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
                    <Flex
                      w="22px"
                      h="22px"
                      borderRadius="6px"
                      bg="var(--elevated-bg)"
                      border="1px solid"
                      borderColor="var(--border-color)"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      {logo && (
                        <Image src={withBase(logo)} alt="" maxW="16px" maxH="16px" objectFit="contain" />
                      )}
                    </Flex>
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

          {/* Filter bar */}
          <Flex
            px={[3, 5]} py={2}
            bg={termBg}
            borderBottom={`1px solid ${termBorder}`}
            gap={1.5}
            align="center"
          >
            {(['all', 'academic', 'industry'] as FilterType[]).map(f => {
              const active = filter === f
              const count = f === 'all' ? stats.total : f === 'academic' ? stats.academic : stats.industry
              return (
                <Text
                  key={f}
                  as="button"
                  px={3} py={1}
                  fontSize="xs"
                  fontWeight={active ? '700' : '500'}
                  letterSpacing="0.02em"
                  borderRadius="full"
                  bg={active ? 'accentSubtle' : 'transparent'}
                  color={active ? 'accent' : termSecondary}
                  onClick={() => setFilter(f)}
                  cursor="pointer"
                  transition="background 0.15s ease, color 0.15s ease"
                  _hover={active ? {} : { bg: hoverBg, color: termText }}
                >
                  {f === 'all' ? t('experience.filterAll') : f === 'academic' ? t('experience.filterAcademic') : t('experience.filterIndustry')} ({count})
                </Text>
              )
            })}
          </Flex>

          {/* ── Experience timeline ───────────────────────── */}
          <Box bg={termBg} color={termText} px={[3, 5]} py={[4, 5]}>
            <Box position="relative" pl="22px">
              {/* Spine */}
              {grouped.length > 0 && (
                <Box
                  position="absolute"
                  left="5px"
                  top="6px"
                  bottom="10px"
                  w="1px"
                  bg="var(--border-color)"
                />
              )}

              {grouped.map(group => (
                <Box key={group.year} mb={6} _last={{ mb: 0 }}>
                  {/* Year node */}
                  <Flex align="center" gap={2} mb={3} position="relative">
                    <Box
                      position="absolute"
                      left="-22px"
                      top="50%"
                      transform="translateY(-50%)"
                      w="11px" h="11px"
                      borderRadius="full"
                      bg={termBg}
                      border="2px solid"
                      borderColor={group.year === 'Present' ? termSuccess : 'accent'}
                    />
                    <Text
                      fontSize="xs" fontWeight="bold"
                      color={group.year === 'Present' ? termSuccess : termSecondary}
                      letterSpacing="0.08em"
                    >
                      {group.year === 'Present' ? t('experience.present').toUpperCase() : group.year}
                    </Text>
                    <Text fontSize="2xs" color={tc.muted}>
                      {group.year === 'Present'
                        ? `${group.items.length} ${t('experience.active')}`
                        : `${group.items.length}`}
                    </Text>
                    <Box flex="1" h="1px" bgGradient={`linear(to-r, ${termBorder}, transparent)`} />
                  </Flex>

                  {/* Entry cards */}
                  <VStack align="stretch" spacing={3}>
                    {group.items.map(exp => {
                      const id = `${exp.title}-${exp.company}-${exp.start}`
                      const isExpanded = !!expandedItems[id]
                      const rt: RoleType = exp.roleType ?? (categoryFilter[exp.category] === 'industry' ? 'sde' : 'research')
                      const rtCfg = roleTypeConfig[rt]
                      const rtColor = rtCfg.color(isDark)
                      const icon = getIconUrl(exp.companyUrl, exp.company, institutionLogos)

                      return (
                        <Box key={id} position="relative">
                          {/* Node dot on the spine */}
                          <Box
                            position="absolute"
                            left="-21px"
                            top={['27px', '31px']}
                            w="9px" h="9px"
                            borderRadius="full"
                            bg={termBg}
                            border="2px solid"
                            borderColor={exp.isCurrent ? termSuccess : 'var(--border-strong)'}
                          />

                          {/* Card */}
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
                            <Flex
                              px={[3, 4]} py={[3, 4]}
                              gap={3}
                              align="start"
                              cursor="pointer"
                              onClick={() => toggleExpanded(id)}
                            >
                              {/* Logo shell */}
                              <Flex
                                w="40px"
                                h="40px"
                                borderRadius="10px"
                                bg="var(--elevated-bg)"
                                border="1px solid"
                                borderColor="var(--border-color)"
                                align="center"
                                justify="center"
                                flexShrink={0}
                                overflow="hidden"
                              >
                                {icon ? (
                                  <Image
                                    src={resolveIconSrc(icon)}
                                    alt=""
                                    maxW="28px"
                                    maxH="28px"
                                    objectFit="contain"
                                    fallback={
                                      <Flex
                                        w="full" h="full"
                                        align="center" justify="center"
                                        fontSize="sm" fontWeight="bold"
                                        color={rtColor}
                                      >
                                        {exp.company.charAt(0)}
                                      </Flex>
                                    }
                                  />
                                ) : (
                                  <Text fontSize="sm" fontWeight="bold" color={rtColor}>
                                    {exp.company.charAt(0)}
                                  </Text>
                                )}
                              </Flex>

                              {/* Content */}
                              <Box flex="1" minW={0}>
                                {/* Role title + type chip */}
                                <Flex align="center" gap={2} flexWrap="wrap" mb={0.5}>
                                  <Text fontFamily="body" fontSize="md" fontWeight="semibold" color={termText} lineHeight="1.35">
                                    {exp.title}
                                  </Text>
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
                                  {exp.isCurrent && (
                                    <Box w="6px" h="6px" borderRadius="full" bg={termSuccess} flexShrink={0} />
                                  )}
                                </Flex>

                                {/* Org name */}
                                <Flex align="center" gap={1.5} flexWrap="wrap" fontSize="sm">
                                  {exp.companyUrl ? (
                                    <Link
                                      href={exp.companyUrl} isExternal
                                      color="accent" fontSize="sm" fontWeight="medium"
                                      onClick={e => e.stopPropagation()}
                                      _hover={{ textDecoration: 'underline', color: 'accentStrong' }}
                                    >
                                      {exp.company}
                                    </Link>
                                  ) : (
                                    <Text color="accent" fontWeight="medium">{exp.company}</Text>
                                  )}
                                </Flex>

                                {/* Period + location */}
                                <Text fontFamily="mono" fontSize="xs" color="textMuted" mt={0.5}>
                                  {fmtDate(exp.start)} – {fmtDate(exp.end)}
                                  {exp.location ? ` · ${exp.location}` : ''}
                                </Text>
                              </Box>

                              {/* Chevron */}
                              <Icon
                                as={FaChevronDown}
                                boxSize="10px"
                                color="textMuted"
                                mt="8px"
                                flexShrink={0}
                                transition="transform 0.2s ease"
                                transform={isExpanded ? 'rotate(180deg)' : 'rotate(0)'}
                              />
                            </Flex>

                            {/* Expanded */}
                            <Collapse in={isExpanded}>
                              <Box pl={[3, '68px']} pr={[3, 4]} pb={[3, 4]}>
                                <Box pl={3} borderLeft={`2px solid ${rtColor}`}>
                                  {exp.summary && (
                                    <Text fontFamily="body" fontSize="sm" color="textSecondary" mb={2} lineHeight="1.7">
                                      {highlightData(exp.summary, hlc)}
                                    </Text>
                                  )}
                                  <VStack align="stretch" spacing={1.5}>
                                    {exp.highlights.map((line: string, i: number) => (
                                      <HStack key={i} fontSize="sm" align="start" spacing={2}>
                                        <Text color={rtColor} flexShrink={0} mt="1px">·</Text>
                                        <Text fontFamily="body" fontSize="sm" color={termText} lineHeight="1.6">
                                          {highlightData(line, hlc)}
                                        </Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                                </Box>
                              </Box>
                            </Collapse>
                          </Box>
                        </Box>
                      )
                    })}
                  </VStack>
                </Box>
              ))}

              {filtered.length === 0 && (
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
            <Box px={[3, 5]} py={2} bg={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'} borderTop={`1px solid ${termBorder}`}>
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
              onKeyPress={e => { if (e.key === 'Enter') handleCommand(command) }}
              placeholder={t('experience.typeHelp')}
              size="xs"
              variant="unstyled"
              color={termText}
              fontFamily="mono"
              flex="1"
            />
            <Box
              h="12px" w="6px" bg={termPrompt} ml={1}
              sx={{ animation: `${blink} 1s step-end infinite` }}
            />
          </Flex>
        </Box>

      </VStack>
    </Box>
  )
}

export default Experience
