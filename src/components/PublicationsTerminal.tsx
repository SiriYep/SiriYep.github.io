import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Link,
  Flex,
  Badge,
  useColorMode,
  Input,
  Select,
  Icon,
  IconButton,
  Collapse,
  Tooltip,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useBreakpointValue,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useTranslation } from 'react-i18next'
import { getPublicationStats } from '../data'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { FaChartBar, FaVideo, FaProjectDiagram, FaFileAlt, FaAtom, FaStar, FaRobot, FaGlobe, FaHandRock, FaCloudSun, FaFutbol } from 'react-icons/fa'
import { IconType } from 'react-icons'
import { highlightData } from '../utils/highlightData'
import { publicationVenueColors, terminalPalette } from '@/config/theme'
import type { Publication } from '@/types'
import { sortPublications, type PublicationOrder } from '@/utils/publicationOrder'

/* ── Emoji → Icon mapping ─────────────────────────────────────── */
const emojiIconMap: Record<string, IconType> = {
  '🎬': FaVideo,
  '🕸️': FaProjectDiagram,
  '📝': FaFileAlt,
  '🌀': FaAtom,
  '🌟': FaStar,
  '🤖': FaRobot,
  '🌐': FaGlobe,
  '🦾': FaHandRock,
  '💭': FaCloudSun,
  '⚽': FaFutbol,
}

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`

const normalizeAuthorName = (name: string) => name.replace(/\*/g, '').trim().toLowerCase()

const PublicationsTerminal: React.FC = () => {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { publications, siteOwner } = useLocalizedData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [publicationOrder, setPublicationOrder] = useState<PublicationOrder>('newest')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [showStats, setShowStats] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [, setCommandHistory] = useState<string[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [imagePreview, setImagePreview] = useState<{ src: string, alt: string } | null>(null)
  const { isOpen: isImageOpen, onOpen: openImageModal, onClose: closeImageModal } = useDisclosure()
  
  const isMobile = useBreakpointValue({ base: true, md: false })
  // Terminal theme colors (centralized)
  const tc = terminalPalette.colors(isDark)
  const termBg = tc.bg
  const termText = tc.text
  const termHeader = tc.header
  const termBorder = tc.border
  const termPrompt = tc.prompt
  const termCommand = tc.command
  const termParam = tc.param
  const termInfo = tc.info
  const termHighlight = tc.highlight
  const termError = tc.error
  const termSuccess = tc.success
  const termWarning = tc.warning
  const termSecondary = tc.secondary
  
  // Venue colors (from config)
  const venueColors = Object.fromEntries(
    Object.entries(publicationVenueColors).map(([k, v]) => [k, { bg: v.bg(isDark), fg: v.fg(isDark), label: v.label }])
  ) as Record<string, { bg: string; fg: string; label: string }>

  // Mono link-chip styling shared by resource links
  const linkChip = {
    bg: 'transparent',
    border: '1px solid',
    borderColor: termBorder,
    color: termSecondary,
    borderRadius: '8px',
    px: 2.5,
    py: 0.5,
    fontSize: '2xs',
    transition: 'border-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
    _hover: { borderColor: termCommand, color: termCommand, transform: 'translateY(-1px)' },
  }
  
  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Get statistics
  const stats = useMemo(() => getPublicationStats(publications), [publications])
  const authorVariants = new Set(
    (siteOwner.name.authorVariants as readonly string[]).map(normalizeAuthorName)
  )
  const isFirstOrCoFirstAuthor = (publication: Publication) => (
    Boolean(publication.isFirstAuthor) ||
    Boolean(
      publication.isCoFirst &&
      publication.coFirstAuthors?.some(author => authorVariants.has(normalizeAuthorName(author)))
    )
  )
  const firstOrCoFirstAuthorCount = publications.filter(isFirstOrCoFirstAuthor).length
  const hasFirstOrCoFirstAuthorPublications = firstOrCoFirstAuthorCount > 0
  
  // Filter publications
  const filteredPublications = useMemo(() => {
    let filtered = [...publications]
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(query) ||
        pub.authors.some(author => author.toLowerCase().includes(query)) ||
        pub.venue.toLowerCase().includes(query) ||
        pub.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      )
    }
    
    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(pub => pub.year.toString() === selectedYear)
    }
    
    // Filter by venue type
    if (selectedVenue !== 'all') {
      filtered = filtered.filter(pub => pub.venueType === selectedVenue)
    }
    
    return sortPublications(filtered, publicationOrder)
  }, [publications, publicationOrder, searchQuery, selectedYear, selectedVenue])

  const filteredFirstOrCoFirstAuthorCount = filteredPublications.filter(isFirstOrCoFirstAuthor).length
  const latestVisibleYear = filteredPublications.reduce(
    (latest, publication) => Math.max(latest, publication.year),
    0,
  )
  
  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a)
    return years
  }, [publications])
  
  // Toggle expanded state
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }
  
  // Handle command input
  const handleCommand = (cmd: string) => {
    const parts = cmd.toLowerCase().split(' ')
    const command = parts[0]
    
    switch (command) {
      case 'search':
        setSearchQuery(parts.slice(1).join(' '))
        break
      case 'filter':
        if (parts[1] === 'year' && parts[2]) {
          setSelectedYear(parts[2])
        } else if (parts[1] === 'venue' && parts[2]) {
          setSelectedVenue(parts[2])
        }
        break
      case 'stats':
        setShowStats(!showStats)
        break
      case 'sort':
        if (parts[1] === 'representative' || parts[1] === 'newest' || parts[1] === 'oldest') {
          setPublicationOrder(parts[1])
        }
        break
      case 'clear':
        setSearchQuery('')
        setSelectedYear('all')
        setSelectedVenue('all')
        setPublicationOrder('newest')
        break
      case 'help':
        alert('Commands: search <query>, filter year <year>, filter venue <type>, sort <representative|newest|oldest>, stats, clear, help')
        break
    }
    
    setCommandHistory(prev => [...prev, cmd])
    setCurrentCommand('')
  }
  
  // Format time
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const showImagePreview = useCallback((src?: string, alt?: string) => {
    if (!src) return
    setImagePreview({ src, alt: alt ?? 'publication preview' })
    openImageModal()
  }, [openImageModal])
  
  return (
    <Box w="full" minH="100vh" bg="var(--bg-color)" py={[8, 10, 12]}>
      <VStack spacing={6} maxW="1400px" mx="auto" px={[2, 4, 6]}>
        {/* Terminal Container */}
        <Box
          w="full"
          borderRadius="12px"
          fontFamily="mono"
          border="1px solid"
          borderColor={termBorder}
          boxShadow="var(--shadow-card)"
          overflow="hidden"
        >
          {/* ═══ Pixel RGB light bar ═══ */}
          <Flex h="2px" w="full" overflow="hidden">
            {(() => {
              const palette = terminalPalette.rainbow;
              const total = 28;
              const tick = Math.floor(currentTime.getTime() / 200);
              return Array.from({ length: total }, (_, i) => {
                const colorIdx = (i + tick) % palette.length;
                const brightness = 0.45 + 0.35 * Math.abs(Math.sin((i + tick * 0.5) * 0.3));
                return <Box key={i} flex={1} h="full" bg={palette[colorIdx]} opacity={brightness} />;
              });
            })()}
          </Flex>

          {/* ═══ Title bar ═══ */}
          <Flex
            bg={termHeader}
            px={4}
            py={2}
            color={termText}
            borderBottom={`1px solid ${termBorder}`}
            justify="space-between"
            align="center"
            fontSize="xs"
            fontWeight="medium"
          >
            <HStack spacing={3}>
              <HStack spacing={1.5}>
                <Box w="10px" h="10px" borderRadius="full" bg="#ff5f56" opacity={0.9} />
                <Box w="10px" h="10px" borderRadius="full" bg="#ffbd2e" opacity={0.9} />
                <Box w="10px" h="10px" borderRadius="full" bg="#27c93f" opacity={0.9} />
              </HStack>
              <Text>
                <Box as="span" color={termParam}>const </Box>
                <Box as="span" color={termPrompt} fontWeight="bold">papers</Box>
                <Box as="span" color={termSecondary}> = </Box>
                <Box as="span" color={termParam}>new </Box>
                <Box as="span" color={termCommand} fontWeight="bold">Explorer</Box>
                <Box as="span" color={termSecondary}>(</Box>
                <Box as="span" color={termHighlight}>'publications'</Box>
                <Box as="span" color={termSecondary}>)</Box>
              </Text>
            </HStack>
            <Text color={termHighlight}>{formattedTime}</Text>
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
              <Text as="span" color={termHighlight}>{stats.total}</Text>
              <Text as="span"> papers</Text>
              {hasFirstOrCoFirstAuthorPublications && (
                <>
                  <Text as="span" color={tc.border}> · </Text>
                  <Text as="span" color={termSuccess}>{firstOrCoFirstAuthorCount} as first/co-first author</Text>
                </>
              )}
              <Text as="span" color={tc.border}> · </Text>
              <Text as="span" color={termCommand}>{Object.keys(stats.byVenue).length} venue types</Text>
              <Text as="span" color={tc.border}> · </Text>
              <Text as="span" color={termParam}>{stats.withCode} open-source</Text>
            </Text>
            <Text color={termCommand} flexShrink={0}>~/papers</Text>
          </Flex>
          
          {/* Stats Dashboard */}
          <Collapse in={showStats}>
            <Box
              px={4}
              py={3}
              bg={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'}
              borderBottom={`1px solid ${termBorder}`}
              sx={{
                '.chakra-stat__label': { fontSize: '2xs', letterSpacing: '0.08em', textTransform: 'uppercase' },
                '.chakra-stat__number': { fontSize: 'xl', fontFamily: 'var(--font-mono)' },
                '.chakra-stat__help-text': { fontSize: '2xs', color: tc.muted, mb: 0 },
              }}
            >
              <SimpleGrid columns={[2, 3, hasFirstOrCoFirstAuthorPublications ? 6 : 5]} spacing={4}>
                <Stat size="sm">
                  <StatLabel color={termInfo}>Total</StatLabel>
                  <StatNumber color={termHighlight}>{stats.total}</StatNumber>
                  <StatHelpText>Papers</StatHelpText>
                </Stat>
                {hasFirstOrCoFirstAuthorPublications && (
                  <Stat size="sm">
                    <StatLabel color={termInfo}>First / Co-First</StatLabel>
                    <StatNumber color={termSuccess}>{firstOrCoFirstAuthorCount}</StatNumber>
                    <StatHelpText>Papers</StatHelpText>
                  </Stat>
                )}
                <Stat size="sm">
                  <StatLabel color={termInfo}>With Code</StatLabel>
                  <StatNumber color={termCommand}>{stats.withCode}</StatNumber>
                  <StatHelpText>Open Source</StatHelpText>
                </Stat>
                <Stat size="sm">
                  <StatLabel color={termInfo}>Conferences</StatLabel>
                  <StatNumber color={termParam}>{stats.byVenue.conference || 0}</StatNumber>
                  <StatHelpText>Main Track</StatHelpText>
                </Stat>
                <Stat size="sm">
                  <StatLabel color={termInfo}>Journals</StatLabel>
                  <StatNumber color={termWarning}>{stats.byVenue.journal || 0}</StatNumber>
                  <StatHelpText>Papers</StatHelpText>
                </Stat>
                <Stat size="sm">
                  <StatLabel color={termInfo}>2025</StatLabel>
                  <StatNumber color={termError}>{stats.byYear[2025] || 0}</StatNumber>
                  <StatHelpText>Latest</StatHelpText>
                </Stat>
              </SimpleGrid>
            </Box>
          </Collapse>
          
          {/* Control Panel */}
          <Box
            px={4}
            py={3}
            bg={termBg}
            borderBottom={`1px solid ${termBorder}`}
          >
            <Flex gap={2} align="center" flexWrap="wrap">
              <Input
                placeholder="grep -i 'robotics' papers/*"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
                flex="1"
                minW="200px"
                bg={isDark ? 'rgba(0,0,0,0.2)' : 'white'}
                border={`1px solid ${termBorder}`}
                borderRadius="8px"
                color={termText}
                _placeholder={{ color: tc.muted }}
                fontFamily="mono"
              />
              
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                size="sm"
                w="120px"
                bg={isDark ? 'rgba(0,0,0,0.2)' : 'white'}
                border={`1px solid ${termBorder}`}
                borderRadius="8px"
                color={termText}
                fontFamily="mono"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
              
              <Select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                size="sm"
                w="140px"
                bg={isDark ? 'rgba(0,0,0,0.2)' : 'white'}
                border={`1px solid ${termBorder}`}
                borderRadius="8px"
                color={termText}
                fontFamily="mono"
              >
                <option value="all">All Venues</option>
                <option value="conference">Conferences</option>
                <option value="journal">Journals</option>
                <option value="workshop">Workshops</option>
                <option value="demo">Demo</option>
                <option value="preprint">Preprints</option>
              </Select>

              <Select
                value={publicationOrder}
                onChange={(e) => setPublicationOrder(e.target.value as PublicationOrder)}
                aria-label={t('publications.sortLabel')}
                size="sm"
                w="180px"
                bg={isDark ? 'rgba(0,0,0,0.2)' : 'white'}
                border="1px solid"
                borderColor={termBorder}
                borderRadius="8px"
                color={termText}
                fontFamily="mono"
              >
                <option value="newest">{t('publications.sortNewest')}</option>
                <option value="representative">{t('publications.sortRepresentative')}</option>
                <option value="oldest">{t('publications.sortOldest')}</option>
              </Select>
              
              <IconButton
                aria-label="Toggle stats"
                icon={<FaChartBar />}
                size="sm"
                borderRadius="8px"
                onClick={() => setShowStats(!showStats)}
                colorScheme={showStats ? "cyan" : "gray"}
                variant={showStats ? "solid" : "outline"}
              />
            </Flex>
          </Box>
          
          {/* Publication List */}
          <Box
            bg={termBg}
            color={termText}
            maxH="70vh"
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': {
                width: '8px',
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: tc.border,
                borderRadius: '4px',
              },
            }}
          >
            {/* List Header */}
            <Flex
              px={4}
              py={2}
              borderBottom={`1px solid ${termBorder}`}
              fontSize="2xs"
              fontWeight="600"
              letterSpacing="0.08em"
              color={termSecondary}
            >
              {!isMobile && <Text w="320px" mr={6}>PREVIEW</Text>}
              <Text flex="1">PUBLICATION</Text>
              {!isMobile && <Text w="150px">RESOURCES</Text>}
              <Text w="50px" textAlign="center">MORE</Text>
            </Flex>
            
            {/* Publications */}
            {filteredPublications.map((pub) => (
              <Box
                key={pub.id}
                borderBottom={`1px solid ${termBorder}`}
                _hover={{
                  bg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                }}
              >
                {/* Main Row */}
                <Flex
                  px={4}
                  py={6}
                  align="center"
                  cursor="pointer"
                  onClick={() => toggleExpanded(pub.id)}
                  fontSize="sm"
                  position="relative"
                  minH="200px"
                >
                  {/* Featured Image Thumbnail */}
                  {pub.featuredImage && !isMobile && (
                    <Box
                      w="320px"
                      h="180px"
                      mr={6}
                      flexShrink={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.8)'}
                      borderRadius="lg"
                      border={`1px solid ${termBorder}`}
                      overflow="hidden"
                      cursor="zoom-in"
                      role="button"
                      tabIndex={0}
                      onClick={() => showImagePreview(pub.featuredImage, `${pub.title} thumbnail`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          showImagePreview(pub.featuredImage, `${pub.title} thumbnail`)
                        }
                      }}
                    >
                      <Image
                        src={pub.featuredImage}
                        alt={`${pub.title} thumbnail`}
                        w="full"
                        h="full"
                        objectFit="contain"
                        p={3}
                        transition="transform 0.2s"
                        _hover={{
                          transform: 'scale(1.05)'
                        }}
                      />
                    </Box>
                  )}
                  
                  {/* Title & Authors */}
                  <Box flex="1" pr={2}>
                    <HStack spacing={1} mb={1} flexWrap="wrap">
                      {pub.emoji && emojiIconMap[pub.emoji] && (
                        <Icon as={emojiIconMap[pub.emoji]} boxSize="14px" color={venueColors[pub.venueType].fg} mr={1} flexShrink={0} />
                      )}
                      <Text fontFamily="body" fontWeight="600" fontSize="md" lineHeight="1.5" flex="1">
                        {pub.title}
                      </Text>
                    </HStack>
                    {/* Venue, Year and Special Badges */}
                    <HStack spacing={1} mb={1} flexWrap="wrap">
                      {/* Venue Badge */}
                      <Badge
                        bg={venueColors[pub.venueType].bg}
                        color={venueColors[pub.venueType].fg}
                        fontSize="2xs"
                        px={2}
                        py={0.5}
                        fontWeight="700"
                        letterSpacing="0.05em"
                      >
                        {pub.venue && String(pub.year) && pub.venue.includes(String(pub.year))
                          ? pub.venue
                          : `${pub.venue} ${pub.year}`}
                      </Badge>
                      
                      {/* Venue Type Badge */}
                      <Badge
                        colorScheme={
                          pub.venueType === 'conference' ? 'blue' :
                          pub.venueType === 'journal' ? 'teal' :
                          pub.venueType === 'workshop' ? 'purple' :
                          pub.venueType === 'demo' ? 'orange' :
                          'green'
                        }
                        fontSize="2xs"
                        px={1.5}
                        py={0}
                      >
                        {venueColors[pub.venueType].label}
                      </Badge>
                      
                      {/* Special Badges */}
                      {pub.specialBadges && pub.specialBadges.map((badge, i) => (
                        badge === 'Best Paper' ? (
                          <Badge
                            key={i}
                            bg={isDark ? 'rgba(235, 203, 139, 0.14)' : 'rgba(163, 123, 44, 0.1)'}
                            color="warm"
                            border="1px solid"
                            borderColor={isDark ? 'rgba(235, 203, 139, 0.35)' : 'rgba(163, 123, 44, 0.3)'}
                            fontSize="2xs"
                            px={1.5}
                            py={0}
                          >
                            {`🏆 ${badge}`}
                          </Badge>
                        ) : (
                          <Badge
                            key={i}
                            colorScheme={
                              badge === 'Oral' ? 'orange' :
                              badge === 'Spotlight' ? 'yellow' :
                              badge === 'Main Track' ? 'blue' :
                              badge === 'First Author' ? 'green' :
                              badge === 'Corresponding' ? 'purple' :
                              badge === 'Demo' ? 'teal' :
                              badge === 'Co-First' ? 'cyan' :
                              'gray'
                            }
                            fontSize="2xs"
                            px={1.5}
                            py={0}
                          >
                            {badge}
                          </Badge>
                        )
                      ))}
                    </HStack>
                    <Text fontFamily="body" fontSize="sm" color={termSecondary}>
                      {pub.authors.map((author, i) => {
                        const cleanAuthor = author.replace('*', '')
                        const hasAsterisk = author.includes('*')
                        const isOwner = (siteOwner.name.authorVariants as readonly string[]).includes(cleanAuthor)
                        const isCoFirstAuthor = pub.isCoFirst && pub.coFirstAuthors?.includes(cleanAuthor)
                        
                        return (
                          <Text as="span" key={i}>
                            {isOwner ? (
                              <Text as="span" color="accent" fontWeight="600">
                                {cleanAuthor}
                                {(hasAsterisk || isCoFirstAuthor) && <Text as="sup" color={termWarning}>*</Text>}
                                {pub.isFirstAuthor && i === 0 && !hasAsterisk && !isCoFirstAuthor && " (1st)"}
                                {pub.isCorrespondingAuthor && " (†)"}
                              </Text>
                            ) : (
                              <>
                                {cleanAuthor}
                                {(hasAsterisk || isCoFirstAuthor) && <Text as="sup" color={termWarning}>*</Text>}
                              </>
                            )}
                            {i < pub.authors.length - 1 ? ", " : ""}
                          </Text>
                        )
                      })}
                      {/* Co-first author note */}
                      {pub.coFirstAuthors && pub.coFirstAuthors.length > 0 && (
                        <Text as="span" fontSize="2xs" color={termInfo} ml={2}>
                          (* co-first)
                        </Text>
                      )}
                    </Text>
                  </Box>
                  
                  {/* Resources */}
                  {!isMobile && (
                    <HStack w="150px" spacing={1} flexWrap="wrap" rowGap={1}>
                      {pub.links.paper && (
                        <Tooltip label="Paper">
                          <Link href={pub.links.paper} isExternal onClick={(e) => e.stopPropagation()}>
                            <Badge {...linkChip}>PDF</Badge>
                          </Link>
                        </Tooltip>
                      )}
                      {pub.links.code && (
                        <Tooltip label="Code">
                          <Link href={pub.links.code} isExternal onClick={(e) => e.stopPropagation()}>
                            <Badge {...linkChip}>CODE</Badge>
                          </Link>
                        </Tooltip>
                      )}
                      {pub.links.projectPage && (
                        <Tooltip label="Project">
                          <Link href={pub.links.projectPage} isExternal onClick={(e) => e.stopPropagation()}>
                            <Badge {...linkChip}>PROJ</Badge>
                          </Link>
                        </Tooltip>
                      )}
                      {Object.keys(pub.links).length > 3 && (
                        <Badge bg="transparent" border="1px solid" borderColor={termBorder} color={tc.muted} borderRadius="8px" px={2} fontSize="2xs">+{Object.keys(pub.links).length - 3}</Badge>
                      )}
                    </HStack>
                  )}
                  
                  {/* Expand Button */}
                  <Text
                    w="50px"
                    textAlign="center"
                    color={expandedItems[pub.id] ? termInfo : termCommand}
                    fontWeight="bold"
                  >
                    {expandedItems[pub.id] ? '[-]' : '[+]'}
                  </Text>
                </Flex>
                
                {/* Expanded Details */}
                <Collapse in={expandedItems[pub.id]}>
                  <Box
                    px={8}
                    py={4}
                    bg={isDark ? 'rgba(76, 86, 106, 0.15)' : 'rgba(203, 213, 225, 0.15)'}
                    borderLeft={`2px solid ${venueColors[pub.venueType].fg}`}
                  >
                    <Flex gap={4} flexDirection={isMobile ? 'column' : 'row'}>
                      {/* Left side - Text content */}
                      <Box flex="1">
                        {/* Abstract */}
                        {pub.abstract && (
                          <Box mb={3}>
                            <Text fontSize="xs" color={termInfo} mb={1}>
                              ── ABSTRACT ─────────────
                            </Text>
                            <Text fontFamily="body" fontSize="sm" color={termText} lineHeight="tall">
                              {highlightData(pub.abstract, { num: termHighlight, kw: termCommand, str: termSuccess })}
                            </Text>
                          </Box>
                        )}
                        
                        {/* Keywords */}
                        {pub.keywords && (
                          <Box mb={3}>
                            <Text fontSize="xs" color={termInfo} mb={1}>
                              ── KEYWORDS ─────────────
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                              {pub.keywords.map((keyword, i) => (
                                <Badge key={i} colorScheme="cyan" fontSize="2xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                        )}
                        
                        {/* All Resources */}
                        <Box>
                          <Text fontSize="xs" color={termInfo} mb={2}>
                            ── RESOURCES ────────────
                          </Text>
                          <Flex flexWrap="wrap" gap={2}>
                            {Object.entries(pub.links).map(([key, url]) => url && (
                              <Link key={key} href={url} isExternal>
                                <Badge
                                  {...linkChip}
                                  fontSize="xs"
                                  px={2.5}
                                  py={1}
                                  textTransform="capitalize"
                                >
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                              </Link>
                            ))}
                          </Flex>
                        </Box>
                      </Box>
                      
                      {/* Right side - Featured Image */}
                      {pub.featuredImage && (
                        <Box 
                          w={isMobile ? "full" : "450px"} 
                          h={isMobile ? "auto" : "300px"}
                          flexShrink={0}
                          order={isMobile ? -1 : 1}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg={isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.9)'}
                          borderRadius="lg"
                          border={`1px solid ${termBorder}`}
                          overflow="hidden"
                          cursor="zoom-in"
                          role="button"
                          tabIndex={0}
                          onClick={() => showImagePreview(pub.featuredImage, `${pub.title} featured image`)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              showImagePreview(pub.featuredImage, `${pub.title} featured image`)
                            }
                          }}
                        >
                          <Image
                            src={pub.featuredImage}
                            alt={`${pub.title} featured image`}
                            w="full"
                            h="full"
                            objectFit="contain"
                            p={4}
                            transition="transform 0.3s"
                            _hover={{
                              transform: 'scale(1.08)',
                              cursor: 'zoom-in'
                            }}
                          />
                        </Box>
                      )}
                    </Flex>
                  </Box>
                </Collapse>
              </Box>
            ))}
            
            {/* No Results */}
            {filteredPublications.length === 0 && (
              <Box px={4} py={8} textAlign="center">
                <Text color={termError} fontSize="sm">
                  No publications found matching criteria
                </Text>
                <Text color={termSecondary} fontSize="xs" mt={2}>
                  Try adjusting your filters or search query
                </Text>
              </Box>
            )}
          </Box>
          
          {/* Command Line Footer */}
          <Flex
            px={4}
            py={2}
            bg={tc.header}
            borderTop={`1px solid ${termBorder}`}
            align="center"
            fontSize="xs"
          >
            <Text color={termPrompt} mr={2}>{siteOwner.terminalUsername}@research:~/papers$</Text>
            <Input
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCommand(currentCommand)
                }
              }}
              placeholder="type 'help' for commands"
              size="xs"
              variant="unstyled"
              color={termText}
              fontFamily="mono"
              flex="1"
            />
            <Box
              h="12px"
              w="6px"
              bg={termPrompt}
              ml={1}
              sx={{
                animation: `${blink} 1s step-end infinite`,
              }}
            />
          </Flex>
        </Box>

        <Modal isOpen={isImageOpen} onClose={closeImageModal} size="4xl" isCentered>
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton color={isDark ? 'gray.200' : 'gray.700'} />
            <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
              {imagePreview && (
                <Image
                  src={imagePreview.src}
                  alt={imagePreview.alt}
                  maxH="80vh"
                  maxW="90vw"
                  objectFit="contain"
                  borderRadius="lg"
                  bg={isDark ? 'rgba(0,0,0,0.85)' : 'white'}
                  p={4}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
        
        {/* Summary Stats Bar */}
        <Flex
          w="full"
          px={4}
          py={2}
          bg={termHeader}
          borderRadius="12px"
          border={`1px solid ${termBorder}`}
          boxShadow="var(--shadow-sm)"
          justify="space-between"
          fontSize="xs"
          fontFamily="mono"
          flexWrap="wrap"
          gap={2}
        >
          <Text color={termInfo}>
            Showing <Text as="span" color={termHighlight} fontWeight="bold">{filteredPublications.length}</Text> of {publications.length} papers
          </Text>
          <HStack spacing={4}>
            {filteredFirstOrCoFirstAuthorCount > 0 && (
              <Text color={termSuccess}>
                First / Co-First: {filteredFirstOrCoFirstAuthorCount}
              </Text>
            )}
            <Text color={termCommand}>
              With Code: {filteredPublications.filter(p => p.links.code).length}
            </Text>
            <Text color={termParam}>
              Latest: {latestVisibleYear || 'N/A'}
            </Text>
          </HStack>
        </Flex>
      </VStack>
    </Box>
  )
}

export default PublicationsTerminal
