import { Box, Container, VStack, Text, Heading, Flex, Link } from '@chakra-ui/react'
import { useLocalizedData } from '@/hooks/useLocalizedData'

const MentorshipSection: React.FC = () => {
  const { about } = useLocalizedData()

  if (!about.mentorship) return null

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={about.mentorship.description ? 3 : 5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{about.mentorship.heading}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        {about.mentorship.description && (
          <Text fontSize="sm" lineHeight="tall" color="textSecondary" mb={5}>
            {about.mentorship.description}
          </Text>
        )}
        <VStack spacing={0} align="stretch">
          {about.mentorship.mentees.map((mentee, index) => (
            <Flex
              key={index}
              align="center"
              gap={3}
              py={3}
              borderBottom="1px solid"
              borderColor="var(--border-color)"
              _last={{ borderBottomWidth: 0 }}
            >
              <Box w="6px" h="6px" borderRadius="full" bg="accent" flexShrink={0} />
              <Link href={mentee.url} isExternal _hover={{ textDecoration: 'none' }}>
                <Text fontSize="sm" fontWeight="medium" color="textPrimary" transition="color 0.15s ease" _hover={{ color: 'accent' }}>
                  {mentee.name}
                </Text>
              </Link>
              {mentee.note && (
                <Text fontSize="xs" fontFamily="mono" color="textMuted">{mentee.note}</Text>
              )}
            </Flex>
          ))}
        </VStack>
      </Container>
    </Box>
  )
}

export default MentorshipSection
