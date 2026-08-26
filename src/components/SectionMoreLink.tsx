import { Box, Flex, Link, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface SectionMoreLinkProps {
  to: string
  children: ReactNode
}

/** Shared homepage CTA for moving from a compact preview to its full page. */
const SectionMoreLink = ({ to, children }: SectionMoreLinkProps) => (
  <Flex
    w="full"
    minH="44px"
    mt={{ base: 3, sm: 4 }}
    align="center"
    gap={{ base: 0, sm: 3 }}
  >
    <Box
      aria-hidden="true"
      display={{ base: 'none', sm: 'block' }}
      flex="1"
      h="1px"
      bgGradient="linear(to-r, transparent, var(--border-strong))"
    />
    <Link
      as={RouterLink}
      to={to}
      display="inline-flex"
      alignItems="center"
      justifyContent={{ base: 'flex-end', sm: 'center' }}
      gap={2}
      minH="44px"
      ml="auto"
      w={{ base: 'full', sm: 'auto' }}
      maxW="full"
      px={1}
      py={1.5}
      borderRadius="6px"
      bg="transparent"
      color="textSecondary"
      fontFamily="mono"
      fontSize={{ base: '2xs', sm: 'xs' }}
      fontWeight="600"
      letterSpacing="wide"
      transition="color .16s ease, background .16s ease"
      _hover={{
        color: 'accent',
        bg: 'var(--hover-color)',
        textDecoration: 'none',
        '& .section-more-arrow': { transform: 'translateX(3px)' },
      }}
      _active={{ color: 'accent' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'accent',
        outlineOffset: '3px',
        color: 'accent',
        '& .section-more-arrow': { transform: 'translateX(3px)' },
      }}
    >
      <Text as="span" textAlign="right" whiteSpace={{ base: 'normal', sm: 'nowrap' }}>
        {children}
      </Text>
      <Text
        as="span"
        className="section-more-arrow"
        aria-hidden="true"
        color="accent"
        flexShrink={0}
        transition="transform .16s ease"
      >
        →
      </Text>
    </Link>
  </Flex>
)

export default SectionMoreLink
