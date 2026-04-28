import { Box, Collapse, Container, Heading, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react'
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
  const tagBg = useColorModeValue('gray.100', 'gray.800')
  const activeTagBg = useColorModeValue('cyan.50', 'gray.700')
  const tagColor = useColorModeValue('gray.700', 'gray.300')
  const iconColor = useColorModeValue('gray.500', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const activeBorderColor = useColorModeValue('cyan.400', 'cyan.500')
  const descBg = useColorModeValue('white', 'gray.900')
  const descColor = useColorModeValue('gray.600', 'gray.400')

  if (skills.length === 0) return null

  const getName = (s: SkillItem) => typeof s === 'string' ? s : s.name
  const getIcon = (s: SkillItem) => typeof s === 'string' ? undefined : s.icon
  const getDescription = (s: SkillItem) => typeof s === 'string' ? undefined : s.description

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={4}>
          <Box h="2px" w="20px" bg="cyan.400" borderRadius="full" flexShrink={0} />
          <Heading size="md" fontWeight="semibold">{t('about.skills', 'Skills')}</Heading>
          <Box flex="1" h="1px" bg={useColorModeValue('gray.200', 'gray.700')} />
        </Flex>
        <Flex gap={2} flexWrap="wrap" align="flex-start">
          {skills.map((skill) => {
            const name = getName(skill)
            const icon = getIcon(skill)
            const description = getDescription(skill)
            const isExpanded = openSkill === name

            if (!description) {
              return (
                <HStack
                  key={name}
                  spacing={1.5}
                  fontSize="xs"
                  fontFamily="mono"
                  px={2.5}
                  py={1}
                  bg={tagBg}
                  color={tagColor}
                  border="1px solid"
                  borderColor="transparent"
                  borderRadius="sm"
                >
                  {icon && (
                    <DynamicIcon name={icon} boxSize={3} color={iconColor} flexShrink={0} />
                  )}
                  <Text>{name}</Text>
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
                  spacing={1.5}
                  fontSize="xs"
                  fontFamily="mono"
                  px={2.5}
                  py={1}
                  bg={isExpanded ? activeTagBg : tagBg}
                  color={tagColor}
                  border="1px solid"
                  borderColor={isExpanded ? activeBorderColor : 'transparent'}
                  borderRadius="sm"
                  cursor="pointer"
                  textAlign="left"
                  transition="all 0.15s"
                  _hover={{ borderColor: activeBorderColor, color: 'cyan.400' }}
                >
                  {icon && (
                    <DynamicIcon name={icon} boxSize={3} color={iconColor} flexShrink={0} />
                  )}
                  <Text>{name}</Text>
                  <DynamicIcon
                    name="FaChevronRight"
                    boxSize={2.5}
                    color={iconColor}
                    flexShrink={0}
                    transition="transform 0.15s"
                    transform={isExpanded ? 'rotate(90deg)' : undefined}
                  />
                </HStack>
                <Collapse in={isExpanded} animateOpacity>
                  <Box
                    mt={1.5}
                    px={2.5}
                    py={2}
                    bg={descBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="sm"
                  >
                    <Text fontSize="2xs" lineHeight="tall" color={descColor}>
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
