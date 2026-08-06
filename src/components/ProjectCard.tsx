import {
  Box, VStack, Heading, Text, HStack, Button, Link, Collapse, Icon,
  useDisclosure, useColorMode,
} from '@chakra-ui/react'
import type { ProjectItem } from '../types'
import { buildCategoryThemes } from '@/config/theme'

interface ProjectCardProps {
  project: ProjectItem
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { isOpen, onToggle } = useDisclosure()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const { title, summary, tags = [], link, extraLinks, highlights, category, date } = project
  const ct = buildCategoryThemes(isDark)[category]

  const primaryLinks = [] as { label: string, url: string }[]
  if (link) primaryLinks.push({ label: 'Project', url: link })
  if (extraLinks && extraLinks.length > 0) {
    extraLinks.forEach((entry) => {
      if (!primaryLinks.some(item => item.url === entry.url)) {
        primaryLinks.push({ label: entry.label, url: entry.url })
      }
    })
  }

  return (
    <Box
      position="relative"
      h="full"
      display="flex"
      flexDirection="column"
      p={[4, 5, 6]}
      bg="var(--card-bg)"
      border="1px solid"
      borderColor="var(--border-color)"
      borderRadius="12px"
      boxShadow="var(--shadow-sm)"
      overflow="hidden"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        transform: 'translateY(-2px)',
        borderColor: ct.border,
        boxShadow: 'var(--shadow-lift)',
      }}
    >
      {/* Category stripe — subtle */}
      <Box position="absolute" top={0} left={0} bottom={0} w="2px"
        bg={ct.stripe} opacity={0.7} pointerEvents="none" />

      <VStack align="start" spacing={[3, 4]} w="full">
        {/* Category + date chips */}
        <HStack spacing={2} flexWrap="wrap">
          <HStack spacing={1} px={2} py={0.5} borderRadius="6px"
            bg={ct.glow} color={ct.color}>
            <Icon as={ct.icon} boxSize="9px" />
            <Text fontSize="2xs" fontFamily="mono" fontWeight="semibold"
              letterSpacing="wide" textTransform="uppercase" lineHeight="1.4">
              {category.replace('_', ' ').toUpperCase()}
            </Text>
          </HStack>
          {date && (
            <Text fontSize="2xs" fontFamily="mono" color="textMuted"
              px={2} py={0.5} borderRadius="6px"
              border="1px solid" borderColor="var(--border-color)"
              letterSpacing="wide" lineHeight="1.4">
              {date}
            </Text>
          )}
        </HStack>

        {/* Faux terminal command — part of the charm */}
        <Text fontFamily="mono" fontSize="11px" color="textMuted" mb={-1} lineHeight="1">
          {ct.cmd}
        </Text>

        <Heading as="h3" size={["sm", "md"]} fontFamily="body" fontWeight="semibold"
          letterSpacing="-0.01em" lineHeight="short" color="textPrimary">
          {title}
        </Heading>

        <Text fontSize="sm" color="textSecondary" lineHeight="tall" noOfLines={3}>
          {summary}
        </Text>

        {tags.length > 0 && (
          <HStack spacing={1.5} flexWrap="wrap">
            {tags.map((tag) => (
              <Text key={tag} fontSize="2xs" fontFamily="mono" letterSpacing="wide"
                px={2} py={0.5} borderRadius="full"
                bg="accentSubtle" color="accent">
                {tag}
              </Text>
            ))}
          </HStack>
        )}
      </VStack>

      {/* Footer pinned to the bottom for equal-height grids */}
      <Box mt="auto" w="full">
        {primaryLinks.length > 0 && (
          <HStack spacing={1.5} flexWrap="wrap" mt={[3, 4]}>
            {primaryLinks.map(({ label, url }) => (
              <Link key={`${label}-${url}`} href={url} isExternal _hover={{ textDecoration: 'none' }}>
                <HStack spacing={1} px={2.5} py={1} borderRadius="6px"
                  border="1px solid" borderColor="var(--border-color)"
                  color="textSecondary" fontSize="xs" fontFamily="mono"
                  transition="border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
                  _hover={{ borderColor: ct.border, color: ct.color, transform: 'translateY(-1px)' }}>
                  <Text>{label} →</Text>
                </HStack>
              </Link>
            ))}
          </HStack>
        )}

        {highlights && highlights.length > 0 && (
          <>
            <Button
              size="xs"
              variant="outline"
              fontFamily="mono"
              fontWeight="500"
              mt={[3, 4]}
              onClick={onToggle}
            >
              {isOpen ? 'Hide Highlights' : 'Show Highlights'}
            </Button>
            <Collapse in={isOpen} animateOpacity>
              <Box
                mt={2}
                w="full"
                p={4}
                bg="var(--hover-color)"
                borderRadius="8px"
                borderLeft="2px solid"
                borderLeftColor={ct.color}
              >
                <VStack as="ul" align="start" spacing={2} fontSize="sm"
                  color="textSecondary" lineHeight="tall" pl={2}>
                  {highlights.map((item, idx) => (
                    <Box as="li" key={idx}>
                      {item}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Collapse>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ProjectCard
