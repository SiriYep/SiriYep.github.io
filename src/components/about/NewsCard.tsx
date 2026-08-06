import React from 'react'
import { Box, VStack, HStack, Text, Link, Button, useColorModeValue, Flex, Heading, Badge } from '@chakra-ui/react'
import DynamicIcon from '../DynamicIcon'
import { NewsItem } from '../../types'

interface NewsCardProps {
  news: NewsItem
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const colorFamily = news.iconColor.split('.')[0]
  const iconBg = useColorModeValue(`${colorFamily}.50`, `${colorFamily}.900`)
  const iconFg = useColorModeValue(`${colorFamily}.500`, `${colorFamily}.200`)

  // Get appropriate icon based on news type
  const getIconName = () => {
    switch (news.type) {
      case 'publication': return 'FaCode';
      case 'talk': return 'SiBilibili';
      case 'course': return 'FaYoutube';
      default: return news.icon || 'FaCode';
    }
  };

  return (
    <Box
      p={0}
      bg="var(--card-bg)"
      border="1px solid"
      borderColor="var(--border-color)"
      borderRadius="12px"
      boxShadow="var(--shadow-sm)"
      transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease"
      _hover={{ transform: 'translateY(-2px)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lift)' }}
      position="relative"
      overflow="hidden"
      role="article"
      aria-labelledby={`news-title-${news.title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Top accent strip */}
      <Box
        h="2px"
        bg={news.iconColor}
        w="full"
        opacity={0.85}
      />

      {/* Date Badge - Top Right Absolute Position */}
      {news.date && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          variant="subtle"
          colorScheme={colorFamily}
          px={2}
          py={0.5}
          borderRadius="6px"
          fontSize="2xs"
          fontFamily="mono"
          letterSpacing="wide"
          fontWeight="medium"
          display="flex"
          alignItems="center"
          zIndex={1}
        >
          <DynamicIcon name="FaClock" boxSize={2.5} mr={1} />
          {news.date}
        </Badge>
      )}

      {/* Content area */}
      <Box p={4}>
        {/* Title area and badges */}
        <Flex mb={3} align="flex-start">
          <Box
            mr={3}
            fontSize="xl"
            bg={iconBg}
            color={iconFg}
            p={2}
            borderRadius="8px"
            lineHeight="1"
            aria-hidden="true"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="32px"
            height="32px"
          >
            <DynamicIcon name={getIconName()} boxSize={4} />
          </Box>
          <VStack align="start" spacing={1} width="100%" pr={12}>
            <Heading
              size="xs"
              fontFamily="mono"
              letterSpacing="-0.01em"
              id={`news-title-${news.title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {news.title}
            </Heading>

            {news.badge && (
              <Badge
                colorScheme={colorFamily}
                variant="subtle"
                fontSize="2xs"
                fontFamily="mono"
                letterSpacing="wide"
                borderRadius="full"
                px={2}
                py={0.5}
              >
                {news.badge}
              </Badge>
            )}
          </VStack>
        </Flex>

        {/* Description text */}
        <Text
          fontSize="sm"
          color="textSecondary"
          mb={3}
          lineHeight="1.7"
        >
          {news.description}
        </Text>

        {/* Button link area */}
        <HStack spacing={2} flexWrap="wrap" gap={2} mt={2}>
          {news.links.map((link, index) => {
            const LinkIcon = link.icon ? <DynamicIcon name={link.icon} fontSize="xs" /> : undefined
            return (
              <Link
                key={index}
                href={link.url}
                isExternal
                aria-label={`${link.text} for ${news.title}`}
              >
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme={colorFamily}
                  fontFamily="mono"
                  borderRadius="6px"
                  transition="all 0.15s ease"
                  _hover={{ transform: 'translateY(-1px)' }}
                  leftIcon={LinkIcon && <Box aria-hidden="true">{LinkIcon}</Box>}
                >
                  {link.text}
                </Button>
              </Link>
            )
          })}
        </HStack>
      </Box>
    </Box>
  )
}

export default NewsCard
