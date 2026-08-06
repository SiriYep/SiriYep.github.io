import React from 'react'
import { Box, Container, VStack, Text } from '@chakra-ui/react'
import { useLocalizedData } from '@/hooks/useLocalizedData'

const Footer: React.FC = () => {
  const { siteOwner } = useLocalizedData()

  return (
    <Box
      as="footer"
      w="full"
      py={[6, 8]}
      mt={[8, 12]}
      borderTop="1px solid"
      borderColor="var(--border-color)"
    >
      <Container maxW="7xl" px={[4, 6, 8]}>
        <VStack spacing={[3, 4]} textAlign="center">
          <Text
            fontFamily="mono"
            fontSize={["2xs", "xs"]}
            letterSpacing="0.04em"
            color="textMuted"
          >
            © {new Date().getFullYear()} {siteOwner.name.display}
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}

export default Footer
