import { Box, Container, HStack, Text, Heading, Flex, Link } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import DynamicIcon from '../DynamicIcon'

const githubHandle = (url: string) => url.replace(/https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')

const ContactSection: React.FC = () => {
  const { t } = useTranslation()
  const { siteOwner } = useLocalizedData()

  const items = [
    siteOwner.contact.academicEmail && { icon: 'FaGraduationCap', label: t('contact.academicEmailLabel', 'Academic'), value: siteOwner.contact.academicEmail, href: `mailto:${siteOwner.contact.academicEmail}` },
    siteOwner.contact.personalEmail && { icon: 'FaEnvelope', label: t('contact.personalEmailLabel', 'Personal'), value: siteOwner.contact.personalEmail, href: `mailto:${siteOwner.contact.personalEmail}` },
    siteOwner.contact.location && { icon: 'FaMapMarkerAlt', label: t('contact.location', 'Location'), value: siteOwner.contact.location },
    siteOwner.social.github && { icon: 'FaGithub', label: 'GitHub', value: githubHandle(siteOwner.social.github), href: siteOwner.social.github },
    siteOwner.social.linkedin && { icon: 'FaLinkedin', label: 'LinkedIn', value: 'in/profile', href: siteOwner.social.linkedin },
    siteOwner.social.googleScholar && { icon: 'SiGooglescholar', label: 'Scholar', value: 'Google Scholar', href: siteOwner.social.googleScholar },
  ].filter(Boolean) as { icon: string; label: string; value: string; href?: string }[]

  if (items.length === 0) return null

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
            const inner = (
              <HStack spacing={2} align="center">
                <DynamicIcon name={item.icon} boxSize={3.5} color="accent" flexShrink={0} />
                <Text as="span" fontFamily="mono" fontSize="xs" color="prompt" whiteSpace="nowrap">
                  {item.label.toLowerCase()}:
                </Text>
                <Text as="span" fontSize="sm" color="textPrimary" whiteSpace="nowrap">
                  {item.value}
                </Text>
              </HStack>
            )

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

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  isExternal
                  {...pillProps}
                  _hover={{ textDecoration: 'none', transform: 'translateY(-1px)', borderColor: 'var(--accent-color)', boxShadow: 'var(--glow-accent)' }}
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
