import { Box, Collapse, Container, Heading, Flex, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import DynamicIcon from '../DynamicIcon'

type SkillItem = string | { name: string; icon?: string; category?: string; description?: string }

const SkillsSection: React.FC = () => {
  const { t } = useTranslation()
  const { siteOwner } = useLocalizedData()
  const [openSkill, setOpenSkill] = useState<string | null>(null)
  const skills = (siteOwner.skills ?? []) as SkillItem[]

  if (skills.length === 0) return null

  const getName = (s: SkillItem) => typeof s === 'string' ? s : s.name
  const getIcon = (s: SkillItem) => typeof s === 'string' ? undefined : s.icon
  const getDescription = (s: SkillItem) => typeof s === 'string' ? undefined : s.description

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.skills', 'Skills')}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        <Flex gap={2.5} flexWrap="wrap" align="flex-start">
          {skills.map((skill) => {
            const name = getName(skill)
            const icon = getIcon(skill)
            const description = getDescription(skill)
            const isExpanded = openSkill === name

            if (!description) {
              return (
                <HStack
                  key={name}
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
              <Box key={name} maxW={["full", "full", "360px"]} w={["full", "auto"]}>
                <HStack
                  as="button"
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setOpenSkill(isExpanded ? null : name)}
                  spacing={2}
                  px={3}
                  py={2}
                  bg={isExpanded ? 'var(--elevated-bg)' : 'var(--card-bg)'}
                  border="1px solid"
                  borderColor={isExpanded ? 'var(--accent-color)' : 'var(--border-color)'}
                  borderRadius="8px"
                  boxShadow="var(--shadow-sm)"
                  cursor="pointer"
                  textAlign="left"
                  transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease, background-color .2s ease"
                  _hover={{ transform: 'translateY(-1px)', borderColor: 'var(--accent-color)', boxShadow: 'var(--glow-accent)' }}
                >
                  {icon && (
                    <DynamicIcon name={icon} boxSize={3} color="textMuted" flexShrink={0} />
                  )}
                  <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="textPrimary" lineHeight="1.4">{name}</Text>
                  <DynamicIcon
                    name="FaChevronRight"
                    boxSize={2.5}
                    color="textMuted"
                    flexShrink={0}
                    transition="transform 0.15s"
                    transform={isExpanded ? 'rotate(90deg)' : undefined}
                  />
                </HStack>
                <Collapse in={isExpanded} animateOpacity>
                  <Box
                    mt={1.5}
                    px={3}
                    py={2.5}
                    bg="var(--card-bg)"
                    border="1px solid"
                    borderColor="var(--border-color)"
                    borderRadius="8px"
                    boxShadow="var(--shadow-sm)"
                  >
                    <Text fontSize="xs" lineHeight="tall" color="textSecondary">
                      {description}
                    </Text>
                  </Box>
                </Collapse>
              </Box>
            )
          })}
        </Flex>
      </Container>
    </Box>
  )
}

export default SkillsSection
