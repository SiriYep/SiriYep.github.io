import { Box, Container, HStack, Text, Heading, Flex, Link, Tooltip } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import DynamicIcon from '../DynamicIcon'

const githubHandle = (url: string) => url.replace(/https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard API unavailable (non-secure context) — legacy fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

interface ContactItem {
  icon: string
  label: string
  value: string
  href?: string
  copyable?: boolean
}

const ContactSection: React.FC = () => {
  const { t } = useTranslation()
  const { siteOwner } = useLocalizedData()
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const handleCopy = (item: ContactItem) => {
    void copyText(item.value)
    setCopiedLabel(item.label)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopiedLabel(null), 1600)
  }

  const items = [
    siteOwner.contact.academicEmail && { icon: 'FaGraduationCap', label: t('contact.academicEmailLabel', 'Academic'), value: siteOwner.contact.academicEmail, copyable: true },
    siteOwner.contact.personalEmail && { icon: 'FaEnvelope', label: t('contact.personalEmailLabel', 'Personal'), value: siteOwner.contact.personalEmail, copyable: true },
    siteOwner.contact.location && { icon: 'FaMapMarkerAlt', label: t('contact.location', 'Location'), value: siteOwner.contact.location },
    siteOwner.social.github && { icon: 'FaGithub', label: 'GitHub', value: githubHandle(siteOwner.social.github), href: siteOwner.social.github },
    siteOwner.social.linkedin && { icon: 'FaLinkedin', label: 'LinkedIn', value: 'in/profile', href: siteOwner.social.linkedin },
    siteOwner.social.googleScholar && { icon: 'SiGooglescholar', label: 'Scholar', value: 'Google Scholar', href: siteOwner.social.googleScholar },
  ].filter(Boolean) as ContactItem[]

  if (items.length === 0) return null

  const pillProps = {
    display: 'inline-flex',
    alignItems: 'center',
    bg: 'var(--card-bg)',
    border: '1px solid',
    borderColor: 'var(--border-color)',
    borderRadius: 'full',
    boxShadow: 'var(--shadow-sm)',
    px: 4,
    py: 2,
    transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
  } as const

  const pillHover = {
    transform: 'translateY(-1px)',
    borderColor: 'var(--accent-color)',
    boxShadow: 'var(--glow-accent)',
  }

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={5}>
          <Text as="span" fontFamily="mono" fontWeight="700" color="prompt" fontSize="lg" lineHeight="1">$</Text>
          <Heading as="h2" size="md" fontFamily="mono" letterSpacing="-0.01em">{t('about.contact', 'Contact')}</Heading>
          <Box flex="1" h="1px" bgGradient="linear(to-r, var(--border-strong), transparent)" />
        </Flex>
        <Flex wrap="wrap" gap={[2, 2.5]} align="center">
          {items.map((item) => {
            const isCopied = copiedLabel === item.label
            const inner = (
              <HStack spacing={2} align="center">
                <DynamicIcon name={isCopied ? 'FaCheck' : item.icon} boxSize={3.5} color={isCopied ? 'prompt' : 'accent'} flexShrink={0} />
                <Text as="span" fontFamily="mono" fontSize="xs" color="prompt" whiteSpace="nowrap">
                  {item.label.toLowerCase()}:
                </Text>
                {/* Value keeps its width while "copied ✓" overlays it, so the pill never resizes */}
                <Box as="span" position="relative" display="inline-block">
                  <Text as="span" fontSize="sm" color="textPrimary" whiteSpace="nowrap" visibility={isCopied ? 'hidden' : 'visible'}>
                    {item.value}
                  </Text>
                  {isCopied && (
                    <Flex
                      as="span"
                      position="absolute"
                      inset={0}
                      align="center"
                      justify="center"
                      fontSize="sm"
                      fontFamily="mono"
                      color="prompt"
                      whiteSpace="nowrap"
                    >
                      {t('contact.copied', 'copied')} ✓
                    </Flex>
                  )}
                </Box>
              </HStack>
            )

            if (item.copyable) {
              return (
                <Tooltip key={item.label} label={t('contact.clickToCopy', 'Click to copy')} placement="top" openDelay={150} hasArrow>
                  <Box
                    as="button"
                    type="button"
                    aria-label={`${t('contact.clickToCopy', 'Click to copy')}: ${item.value}`}
                    onClick={() => handleCopy(item)}
                    cursor="pointer"
                    {...pillProps}
                    _hover={pillHover}
                  >
                    {inner}
                  </Box>
                </Tooltip>
              )
            }

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  isExternal
                  {...pillProps}
                  _hover={{ textDecoration: 'none', ...pillHover }}
                >
                  {inner}
                </Link>
              )
            }

            return (
              <Box key={item.label} {...pillProps}>
                {inner}
              </Box>
            )
          })}
        </Flex>
      </Container>
    </Box>
  )
}

export default ContactSection
