import React, { useCallback, useMemo, useState } from 'react'
import {
  Box, Collapse, Flex, Heading, HStack, Icon, Input, Link, Text, VStack,
  Image, useColorMode,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { IconType } from 'react-icons'
import {
  FaFolderOpen, FaUser, FaCrown, FaCog, FaSync, FaPuzzlePiece, FaChevronDown,
  FaGithub, FaMedium, FaYoutube, FaExternalLinkAlt,
} from 'react-icons/fa'
import { SiZhihu, SiCsdn } from 'react-icons/si'
import { useTranslation } from 'react-i18next'
import type { ProjectItem } from '../types'
import { withBase } from '@/utils/asset'
import { highlightData } from '@/utils/highlightData'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { useGitHubStars } from '@/hooks/useGitHubStars'
import { buildCategoryThemes, terminalPalette, type CatTheme } from '@/config/theme'

/* ── Keyframes ─────────────────────────────────────────────────── */
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0}`
const bob = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}`

/* ── Types ─────────────────────────────────────────────────────── */
type TP = ProjectItem & { id: string }
type TabKey = 'all' | ProjectItem['category']

type CatThemeWithAnim = CatTheme & { anim: string }

/* ── Category themes (from config, with animation added) ──────── */
const buildThemes = (dk: boolean): Record<ProjectItem['category'], CatThemeWithAnim> => {
  const base = buildCategoryThemes(dk)
  const b = bob
  const durations: Record<ProjectItem['category'], number> = {
    robotics: 2.2, nlp: 1.8, 'web-app': 2.0, data: 2.4, tooling: 2.6, healthcare: 1.6, resources: 2.0, agent: 2.2,
  }
  const result = {} as Record<ProjectItem['category'], CatThemeWithAnim>
  for (const [k, v] of Object.entries(base) as [ProjectItem['category'], CatTheme][]) {
    result[k] = { ...v, anim: `${b} ${durations[k]}s ease-in-out infinite` }
  }
  return result
}

/* ── Role config ───────────────────────────────────────────────── */
const roleConfig: Record<string, { textKey: string; icon: IconType; color: (d: boolean) => string }> = {
  independent: { textKey: 'projects.independent', icon: FaUser,        color: d => d ? '#ebcb8b' : '#c47d46' },
  lead:        { textKey: 'projects.lead',        icon: FaCrown,       color: d => d ? '#d08770' : '#b35a2e' },
  'tech-lead': { textKey: 'projects.techLead',    icon: FaCog,         color: d => d ? '#88c0d0' : '#2a769c' },
  maintainer:  { textKey: 'projects.maintainer',  icon: FaSync,        color: d => d ? '#a3be8c' : '#36805a' },
  contributor: { textKey: 'projects.contributor', icon: FaPuzzlePiece, color: d => d ? '#b48ead' : '#7d4f8c' },
}

/* ── Helpers ────────────────────────────────────────────────────── */
const linkIcon = (url: string): IconType => {
  if (url.includes('github.com')) return FaGithub
  if (url.includes('medium.com')) return FaMedium
  if (url.includes('youtu.be') || url.includes('youtube.com')) return FaYoutube
  if (url.includes('zhihu.com')) return SiZhihu
  if (url.includes('csdn.net')) return SiCsdn
  return FaExternalLinkAlt
}

const fmtDate = (v?: string) => {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}
const getYear = (v?: string) => {
  if (!v) return 'Unknown'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? 'Unknown' : String(d.getFullYear())
}

/* ── Flow Node (About-page design language) ──────────────────── */
const FlowNode: React.FC<{
  item: TP; ct: CatTheme; isDark: boolean; isLast: boolean
  termText: string
  termSecondary: string; termMuted: string; termBorder: string
  hlc: { num: string; kw: string; str: string }
  onImageClick: (src: string, alt: string) => void
}> = ({ item, ct, isDark, isLast: _isLast, termText, termSecondary, termMuted, termBorder, hlc, onImageClick }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const role = roleConfig[item.role || 'independent']
  const liveStars = useGitHubStars(item.link)
  const isStarBadge = !!item.badge && /star/i.test(item.badge)
  const badges: { text: string; star: boolean }[] = []
  if (item.badge && !(isStarBadge && liveStars)) badges.push({ text: item.badge, star: isStarBadge })
  if (liveStars) badges.push({ text: `${liveStars} stars`, star: true })
  const hasImg = !!item.featuredImage
  const res: { label: string; url: string }[] = []
  if (item.link) res.push({ label: t('projects.source'), url: item.link })
  item.extraLinks?.forEach(l => { if (!res.some(r => r.url === l.url)) res.push(l) })
  const hasExpandable = (item.highlights && item.highlights.length > 0) || item.story

  return (
    <Flex gap={[3, 3, 4]} align="start" py={3} position="relative">
      {/* Dot — hollow ring, filled for featured/last */}
      <Box flexShrink={0} mt="6px">
        <Box
          w="14px" h="14px" borderRadius="full"
          border="2px solid"
          borderColor={item.featured ? ct.color : termBorder}
          bg={item.featured ? ct.color : 'transparent'}
          boxShadow={item.featured ? `0 0 8px ${ct.glow}` : undefined}
          transition="all 0.2s"
        />
      </Box>

      {/* Content */}
      <Box flex={1} minW={0}>
        {/* Category + Role + Date label line */}
        <HStack spacing={2} mb={1.5} flexWrap="wrap" align="center">
          <HStack spacing={1} px={1.5} py={0.5} borderRadius="6px"
            bg={ct.glow} color={ct.color}>
            <Icon as={ct.icon} boxSize="9px" />
            <Text fontSize="2xs" fontFamily="mono" fontWeight="semibold"
              letterSpacing="wide" textTransform="uppercase" lineHeight="1.4">
              {ct.label}
            </Text>
          </HStack>
          <Text fontSize="2xs" fontFamily="mono" color={termMuted}>/</Text>
          <HStack spacing={1}>
            <Icon as={role.icon} boxSize="9px" color={role.color(isDark)} />
            <Text fontSize="2xs" fontFamily="mono" color={role.color(isDark)} fontWeight="semibold"
              letterSpacing="wide">
              {t(role.textKey)}
            </Text>
          </HStack>
          <Text fontSize="2xs" fontFamily="mono" color={termMuted} ml="auto" flexShrink={0}>
            {fmtDate(item.date)}
          </Text>
        </HStack>

        {/* Title */}
        <Text fontFamily="body" fontSize={['sm', 'md']} fontWeight="semibold" lineHeight="tall"
          letterSpacing="-0.01em" color={termText} mb={1}
          cursor={hasExpandable ? 'pointer' : undefined}
          transition="color 0.15s ease"
          _hover={hasExpandable ? { color: ct.color } : undefined}
          onClick={hasExpandable ? () => setExpanded(p => !p) : undefined}>
          {item.title}
          {item.featured && (
            <Text as="span" ml={2} fontSize="xs" color={hlc.num}>★</Text>
          )}
        </Text>

        {/* Badges */}
        {badges.length > 0 && (
          <HStack spacing={1.5} mb={2} flexWrap="wrap">
            {badges.map((b, i) => (
              <HStack key={i} spacing={1} px={2} py={0.5} borderRadius="6px"
                border="1px solid" borderColor={ct.border} color={ct.color}
                bg={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
                fontSize="2xs" fontFamily="mono" letterSpacing="wide"
                transition="border-color 0.15s ease, color 0.15s ease"
                _hover={b.star ? { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' } : undefined}>
                {b.star && <Text as="span" lineHeight="1">★</Text>}
                <Text as="span">{b.text}</Text>
              </HStack>
            ))}
          </HStack>
        )}

        {/* Body: image left + summary right */}
        <Flex direction={['column', 'column', hasImg ? 'row' : 'column']}
          gap={[3, 3, 4]} align="stretch">
          {hasImg && (
            <Box
              flexShrink={0} w={['full', 'full', '260px']}
              minH={['180px', '200px', 'auto']}
              cursor="zoom-in" overflow="hidden" borderRadius="sm"
              onClick={() => {
                const img = item.featuredImage
                if (img) onImageClick(withBase(img) as string, item.title)
              }}
            >
              <Image src={withBase(item.featuredImage!)} alt={item.title}
                w="full" h="full" objectFit="contain"
                bg={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'} p={1}
                transition="transform 0.3s" _hover={{ transform: 'scale(1.03)' }} />
            </Box>
          )}

          <VStack align="start" spacing={2.5} flex={1} minW={0} justify="center">
            {/* Summary */}
            <Text fontFamily="body" fontSize={['xs', 'sm']} lineHeight="tall" color={termSecondary}>
              {highlightData(item.summary, hlc)}
            </Text>

            {/* Divider */}
            <Box w="full" h="1px" bgGradient={`linear(to-r, ${termBorder}, transparent)`} />

            {/* Links + Expand button row */}
            <HStack spacing={1.5} flexWrap="wrap">
              {res.map(r => (
                <Link key={r.url} href={r.url} isExternal
                  onClick={e => e.stopPropagation()} _hover={{ textDecoration: 'none' }}>
                  <HStack spacing={1.5} px={2.5} py={1} borderRadius="6px"
                    border="1px solid" borderColor={termBorder}
                    color={termSecondary} fontSize="xs" fontFamily="mono"
                    transition="border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
                    _hover={{ borderColor: ct.color, color: ct.color, transform: 'translateY(-1px)' }}>
                    <Icon as={linkIcon(r.url)} boxSize="11px" />
                    <Text>{r.label}</Text>
                  </HStack>
                </Link>
              ))}
              {hasExpandable && (
                <HStack as="button" spacing={1.5} px={2.5} py={1} borderRadius="6px"
                  border="1px solid" fontSize="xs" fontFamily="mono"
                  borderColor={expanded ? ct.color : termBorder}
                  color={expanded ? ct.color : termSecondary}
                  transition="border-color 0.15s ease, color 0.15s ease"
                  _hover={{ borderColor: ct.color, color: ct.color }}
                  onClick={() => setExpanded(p => !p)}>
                  <Icon as={FaChevronDown} boxSize="8px"
                    transition="transform 0.15s ease"
                    transform={expanded ? 'rotate(180deg)' : undefined} />
                  <Text>{expanded ? t('projects.less') : t('projects.details')}</Text>
                </HStack>
              )}
            </HStack>

            {/* Tags as simple pills */}
            {item.tags.length > 0 && (
              <HStack spacing={1.5} flexWrap="wrap">
                {item.tags.map(t => (
                  <Text key={t} fontSize="2xs" fontFamily="mono" letterSpacing="wide"
                    color={termMuted} px={2} py={0.5}
                    bg={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                    borderRadius="full">
                    {t}
                  </Text>
                ))}
              </HStack>
            )}
          </VStack>
        </Flex>

        {/* Expandable details */}
        <Collapse in={expanded} animateOpacity>
          <VStack align="stretch" spacing={3} mt={3}>
            {item.highlights && item.highlights.length > 0 && (
              <Box>
                {item.highlights.map((h, i) => (
                  <Text key={i} fontFamily="body" fontSize="xs" color={termSecondary} lineHeight="1.8">
                    <Text as="span" fontFamily="mono" color={ct.color} mr={1.5}>▸</Text>{highlightData(h, hlc)}
                  </Text>
                ))}
              </Box>
            )}

            {item.story && (
              <Box p={3} bg={isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)'}
                borderRadius="8px" borderLeft="2px solid" borderLeftColor={ct.color}>
                <Text fontFamily="body" fontSize={['xs', 'xs']} lineHeight="tall" color={termSecondary} fontStyle="italic">
                  "{highlightData(item.story, hlc)}"
                </Text>
              </Box>
            )}
          </VStack>
        </Collapse>
      </Box>
    </Flex>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ── Main Projects Component ──
   ══════════════════════════════════════════════════════════════════ */
const Projects: React.FC = () => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { t } = useTranslation()
  const { projects: projectData, siteOwner } = useLocalizedData()

  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [imgPreview, setImgPreview] = useState<{ src: string; alt: string } | null>(null)
  const { isOpen: isImgOpen, onOpen: openImg, onClose: closeImg } = useDisclosure()

  /* Terminal palette (centralized) */
  const tc = terminalPalette.colors(isDark)
  const termBg       = tc.bg
  const termText     = tc.text
  const termHeader   = tc.header
  const termTabBar   = tc.tabBar
  const termBorder   = tc.border
  const termPrompt   = tc.prompt
  const termInfo     = tc.info
  const termHighlight = tc.highlight
  const termSecondary = tc.secondary
  const termMuted    = tc.muted
  const termCommand  = tc.command
  const termSuccess  = tc.success
  const hlc = { num: termHighlight, kw: termCommand, str: termSuccess }

  const themes = useMemo(() => buildThemes(isDark), [isDark])

  const projects = useMemo<TP[]>(() =>
    projectData.map((p, i) => ({ ...p, id: `p-${i}` }))
  , [projectData])

  /* ── Tabs ── */
  const tabs = useMemo(() => {
    const cnt: Record<string, number> = { all: projects.length }
    projects.forEach(p => { cnt[p.category] = (cnt[p.category] || 0) + 1 })
    const cats: ProjectItem['category'][] = ['robotics', 'nlp', 'web-app', 'data', 'tooling', 'healthcare', 'resources', 'agent']
    return [
      {
        key: 'all' as TabKey, icon: FaFolderOpen, label: t('projects.all'),
        color: termInfo, activeBg: 'var(--accent-light)', count: cnt.all,
      },
      ...cats.filter(k => cnt[k] > 0).map(k => ({
        key: k as TabKey, icon: themes[k].icon, label: t(`category.${k}`),
        color: themes[k].color, activeBg: themes[k].glow, count: cnt[k],
      })),
    ]
  }, [projects, themes, termInfo])

  /* ── Filtering + sorting ── */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return projects
      .filter(p => {
        if (activeTab !== 'all' && p.category !== activeTab) return false
        if (!q) return true
        return [p.title, p.summary, p.tags?.join(' '), p.highlights?.join(' ')]
          .filter(Boolean).some(s => (s as string).toLowerCase().includes(q))
      })
      .sort((a, b) => {
        const da = a.date ? Date.parse(a.date) : 0
        const db = b.date ? Date.parse(b.date) : 0
        if (da !== db) return db - da
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return a.title.localeCompare(b.title)
      })
  }, [projects, searchQuery, activeTab])

  /* ── Year groups ── */
  const yearGroups = useMemo(() => {
    const g: Record<string, TP[]> = {}
    filtered.forEach(p => { const y = getYear(p.date); (g[y] ??= []).push(p) })
    return Object.entries(g)
      .sort(([a], [b]) => a === 'Unknown' ? 1 : b === 'Unknown' ? -1 : Number(b) - Number(a))
      .map(([year, items]) => ({ year, items }))
  }, [filtered])

  /* ── Stats ── */
  const totalIndep = useMemo(() => projects.filter(p => !p.role || p.role === 'independent').length, [projects])
  const filteredIndep = useMemo(() => filtered.filter(p => !p.role || p.role === 'independent').length, [filtered])

  const onImgClick = useCallback((src: string, alt: string) => {
    setImgPreview({ src, alt }); openImg()
  }, [openImg])

  const promptPath = activeTab === 'all' ? '~' : `~/${activeTab}`

  return (
    <Box w="full" minH="100vh" py={[8, 10, 12]}>
      <VStack maxW="1400px" mx="auto" spacing={5} px={[2, 4, 8]}>
        {/* ═══ Section header ═══ */}
        <Flex w="full" align="center" gap={3}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">
            {t('nav.projects')}
          </Heading>
          <Text as="span" fontFamily="mono" fontSize="2xs" fontWeight="600" letterSpacing="wide"
            px={2} py={0.5} borderRadius="full" bg="accentSubtle" color="accent">
            {projects.length}
          </Text>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>

        <Box
          w="full" borderRadius="12px" fontFamily="mono" overflow="hidden"
          border="1px solid" borderColor={termBorder}
          boxShadow="var(--shadow-card)"
        >
          {/* ═══ Pixel RGB light bar ═══ */}
          <Flex h="2px" w="full" overflow="hidden">
            {(() => {
              const palette = terminalPalette.rainbow;
              const total = 28;
              const tick = Math.floor(Date.now() / 200);
              return Array.from({ length: total }, (_, i) => {
                const colorIdx = (i + tick) % palette.length;
                const brightness = 0.45 + 0.35 * Math.abs(Math.sin((i + tick * 0.5) * 0.3));
                return <Box key={i} flex={1} h="full" bg={palette[colorIdx]} opacity={brightness} />;
              });
            })()}
          </Flex>

          {/* ═══ TITLE BAR ═══ */}
          <Flex bg={termHeader} px={4} py={2} align="center" justify="space-between" fontSize="xs" color={termText}>
            <HStack spacing={3}>
              <HStack spacing={1.5}>
                <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" opacity={0.9} />
                <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" opacity={0.9} />
                <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" opacity={0.9} />
              </HStack>
              <Text>
                <Box as="span" color={tc.param}>const </Box>
                <Box as="span" color={termPrompt} fontWeight="bold">projects</Box>
                <Box as="span" color={termMuted}> = </Box>
                <Box as="span" color={tc.param}>new </Box>
                <Box as="span" color={termInfo} fontWeight="bold">Portfolio</Box>
                <Box as="span" color={termMuted}>(</Box>
                <Box as="span" color={termHighlight}>'showcase'</Box>
                <Box as="span" color={termMuted}>)</Box>
              </Text>
            </HStack>
            <Text color={termMuted} fontSize="xs">
              {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </Flex>

          {/* ═══ Touch bar ═══ */}
          <Flex
            bg={tc.touchBar}
            px={4}
            py={1}
            borderBottom={`1px solid ${termBorder}`}
            fontSize="2xs"
            align="center"
            justify="space-between"
            overflow="hidden"
          >
            <Text color={termSecondary} isTruncated>
              <Text as="span" color={termPrompt} fontWeight="bold">{siteOwner.terminalUsername}</Text>
              <Text as="span" color={tc.border}> · </Text>
              <Text as="span" color={termHighlight}>{projects.length}</Text>
              <Text as="span"> {t('projects.projectsAcross')} </Text>
              <Text as="span" color={termPrompt}>{totalIndep} {t('projects.independentlyBuilt')}</Text>
            </Text>
            <Text color={termInfo} flexShrink={0}>~/projects/{promptPath === '~' ? 'all' : activeTab}</Text>
          </Flex>

          {/* ═══ TAB BAR — filter chips ═══ */}
          <Flex
            bg={termTabBar} overflowX="auto" borderBottom={`1px solid ${termBorder}`}
            px={3} py={2} gap={1.5} align="center"
            sx={{ '&::-webkit-scrollbar': { height: '0' } }}
          >
            {tabs.map(tab => {
              const active = activeTab === tab.key
              return (
                <Flex
                  key={tab.key} as="button" align="center" gap={1.5}
                  px={2.5} py={1} fontSize="xs" fontFamily="mono"
                  borderRadius="full" border="1px solid"
                  borderColor={active ? tab.color : 'transparent'}
                  color={active ? tab.color : termSecondary}
                  bg={active ? tab.activeBg : 'transparent'}
                  fontWeight={active ? 'semibold' : 'normal'}
                  transition="color 0.15s ease, border-color 0.15s ease, background 0.15s ease"
                  _hover={{
                    color: tab.color,
                    borderColor: active ? tab.color : termBorder,
                  }}
                  onClick={() => setActiveTab(tab.key)}
                  flexShrink={0} whiteSpace="nowrap"
                >
                  <Box sx={active && tab.key !== 'all'
                    ? { animation: themes[tab.key as ProjectItem['category']].anim }
                    : undefined}>
                    <Icon as={tab.icon} boxSize="11px" display="block" />
                  </Box>
                  {tab.label}
                  <Text as="span" opacity={0.65}>({tab.count})</Text>
                </Flex>
              )
            })}
          </Flex>

          {/* ═══ TOOLBAR ═══ */}
          <Flex
            px={4} py={2} bg={termBg} borderBottom={`1px solid ${termBorder}`}
            align="center" gap={2} fontSize="xs"
          >
            <Text color={termPrompt} flexShrink={0}>{siteOwner.terminalUsername}@projects:{promptPath}$</Text>
            <Input
              placeholder="grep -i '...'"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              size="xs" variant="unstyled" color={termText} fontFamily="mono"
              flex="1" minW="120px" _placeholder={{ color: termMuted }}
            />
          </Flex>

          {/* ═══ CONTENT — Timeline Flow ═══ */}
          <Box
            key={activeTab}
            bg={termBg} color={termText}
            maxH="75vh" overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': { width: '6px', background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: tc.border, borderRadius: '3px' },
            }}
          >
            <Box px={[3, 4, 5]} py={4}>
              {yearGroups.map((group, gi) => (
                <Box key={group.year} mb={gi < yearGroups.length - 1 ? 6 : 0}>
                  {/* Year heading */}
                  <HStack spacing={2} mb={2} pl="2px">
                    <Text fontSize="2xs" fontFamily="mono" color={termHighlight}
                      fontWeight="semibold" letterSpacing="wide">
                      {group.year}
                    </Text>
                    <Box flex="1" h="1px" bgGradient={`linear(to-r, ${termBorder}, transparent)`} />
                    <Text fontSize="2xs" fontFamily="mono" color={termMuted}>
                      {group.items.length} {t('projects.projects')}
                    </Text>
                  </HStack>

                  {/* Timeline with vertical line */}
                  <Box position="relative">
                    {/* Global vertical line */}
                    <Box position="absolute" left="7px" top="12px" bottom="12px"
                      w="1px" bg={termBorder} opacity={0.3} />

                    <VStack spacing={0} align="stretch">
                      {group.items.map((item, idx) => (
                        <FlowNode key={item.id} item={item} ct={themes[item.category]}
                          isDark={isDark} isLast={idx === group.items.length - 1}
                          termText={termText}
                          termSecondary={termSecondary} termMuted={termMuted}
                          termBorder={termBorder}
                          hlc={hlc}
                          onImageClick={onImgClick} />
                      ))}
                    </VStack>
                  </Box>
                </Box>
              ))}
            </Box>

            {filtered.length === 0 && (
              <Box px={4} py={8} textAlign="center">
                <Text color={termHighlight} fontSize="sm">{t('projects.noMatches')}</Text>
                <Text color={termSecondary} fontSize="xs" mt={1}>{t('projects.tryAdjustingSearch')}</Text>
              </Box>
            )}
          </Box>

          {/* ═══ STATUS BAR ═══ */}
          <Flex
            px={4} py={1.5} bg={termHeader} borderTop={`1px solid ${termBorder}`}
            align="center" justify="space-between" fontSize="2xs" color={termMuted}
            flexWrap="wrap" gap={2}
          >
            <HStack spacing={3}>
              <Text>{filtered.length}/{projects.length} {t('projects.shown')}</Text>
              <HStack spacing={1} color={termHighlight}>
                <Icon as={FaUser} boxSize="9px" />
                <Text fontWeight="bold">{filteredIndep} {t('projects.independent')}</Text>
              </HStack>
            </HStack>
            <HStack spacing={1}>
              <Text color={termPrompt}>{siteOwner.terminalUsername}@projects:{promptPath}$</Text>
              <Box w="6px" h="11px" bg={termPrompt} sx={{ animation: `${blink} 1s step-end infinite` }} />
            </HStack>
          </Flex>
        </Box>

        {/* ── Image Modal ── */}
        <Modal isOpen={isImgOpen} onClose={closeImg} size="4xl" isCentered>
          <ModalOverlay bg="rgba(0,0,0,0.75)" backdropFilter="blur(4px)" />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton color={isDark ? 'gray.200' : 'gray.700'} />
            <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
              {imgPreview && (
                <Image src={imgPreview.src} alt={imgPreview.alt}
                  maxH="80vh" maxW="90vw" objectFit="contain" borderRadius="md"
                  bg={isDark ? 'rgba(0,0,0,0.85)' : 'white'} p={4}
                  border={`1px solid ${termBorder}`} />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}

export default Projects
