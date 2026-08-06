import {
  Box, Flex, IconButton, useColorMode, HStack, Link as ChakraLink,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
  VStack, Divider, Button
} from '@chakra-ui/react'
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { Link, useLocation } from 'react-router-dom'
import { FaGithub, FaLinkedin, FaMedium, FaEnvelope } from 'react-icons/fa'
import { LuBot } from 'react-icons/lu'
import { SiGooglescholar } from 'react-icons/si'
import { useTranslation } from 'react-i18next'
import { navItems, siteOwner } from '@/site.config'

const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const location = useLocation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
  }

  const socialLinks = [
    { icon: FaEnvelope, href: `mailto:${siteOwner.contact.email}`, label: 'Email' },
    { icon: FaGithub, href: siteOwner.social.github, label: 'GitHub' },
    { icon: FaLinkedin, href: siteOwner.social.linkedin, label: 'LinkedIn' },
    { icon: FaMedium, href: siteOwner.social.medium, label: 'Medium' },
    { icon: SiGooglescholar, href: siteOwner.social.googleScholar, label: 'Google Scholar' },
  ].filter(link => link.href)

  return (
    <Box
      as="nav"
      py={3}
      borderBottom="1px solid"
      borderColor="var(--border-color)"
      position="sticky"
      top={0}
      bg="color-mix(in srgb, var(--bg-color) 78%, transparent)"
      sx={{
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
      }}
      zIndex={1000}
      w="full"
    >
      <Flex
        justify="space-between"
        align="center"
        w="full"
        px={4}
        position="relative"
      >
        {/* Mobile: hamburger */}
        <Box display={{ base: 'block', md: 'none' }}>
          <IconButton
            aria-label={t('aria.openNav')}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            color="var(--text-color)"
            _hover={{ bg: 'var(--hover-color)' }}
          />
        </Box>

        {/* Desktop: logo left */}
        <ChakraLink
          as={Link}
          to="/"
          aria-label="TermHub home"
          display={{ base: 'none', md: 'flex' }}
          alignItems="center"
          justifyContent="center"
          h="44px"
          w="auto"
          gap={2}
          px={2}
          borderRadius="md"
          color="yellow.400"
          _hover={{
            bg: 'var(--hover-color)',
            transform: 'translateY(-1px)',
            filter: 'drop-shadow(0 3px 10px color-mix(in srgb, currentColor 40%, transparent))',
          }}
          transition="transform 0.2s ease, background 0.2s ease, filter 0.2s ease"
        >
          <Box as={LuBot} fontSize="2.1rem" flexShrink={0} />
          <Box
            as="span"
            fontFamily="mono"
            fontSize="1rem"
            fontWeight={700}
            lineHeight="1"
            letterSpacing="-0.01em"
          >
            SiriYep
          </Box>
        </ChakraLink>

        {/* Desktop nav (right aligned) */}
        <HStack
          spacing={7}
          display={{ base: 'none', md: 'flex' }}
          ml="auto"
          mr={{ base: 0, md: 6 }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <ChakraLink
                key={item.path}
                as={Link}
                to={item.path}
                position="relative"
                fontFamily="mono"
                fontSize="sm"
                fontWeight={isActive ? 600 : 500}
                lineHeight="1.2"
                py={1}
                color={isActive ? 'accent' : 'var(--secondary-text)'}
                _hover={{
                  textDecoration: 'none',
                  color: isActive ? 'accent' : 'var(--text-color)',
                }}
                transition="color 0.2s ease"
              >
                {t(item.labelKey)}
                {isActive && (
                  <Box
                    position="absolute"
                    bottom="-5px"
                    left="0"
                    right="0"
                    h="2px"
                    borderRadius="full"
                    bg="accent"
                    boxShadow="0 0 8px 1px var(--accent-light)"
                  />
                )}
              </ChakraLink>
            )
          })}
        </HStack>
        <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
          {socialLinks.map((link) => (
            <ChakraLink
              key={link.label}
              href={link.href}
              isExternal
              aria-label={link.label}
              color="var(--secondary-text)"
              p={1.5}
              borderRadius="md"
              _hover={{
                color: 'var(--accent-color)',
                transform: 'translateY(-2px)',
                bg: 'var(--hover-color)',
              }}
              transition="color 0.2s ease, transform 0.2s ease, background 0.2s ease"
            >
              <Box
                as={link.icon}
                fontSize="1.2rem"
              />
            </ChakraLink>
          ))}
          {/* Language switcher */}
          <Button
            size="xs"
            variant="ghost"
            color="var(--text-color)"
            fontFamily="mono"
            fontWeight="600"
            fontSize="xs"
            letterSpacing="0.02em"
            px={2}
            minW="auto"
            onClick={toggleLanguage}
            aria-label={t('aria.toggleLanguage')}
            _hover={{
              bg: 'var(--hover-color)',
              transform: 'translateY(-2px)'
            }}
            transition="transform 0.2s ease, background 0.2s ease"
          >
            {i18n.language === 'zh' ? 'EN' : '中'}
          </Button>
          <IconButton
            aria-label={t('aria.toggleColorMode')}
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            color="var(--text-color)"
            _hover={{
              bg: 'var(--hover-color)',
              transform: 'translateY(-2px)'
            }}
            transition="transform 0.2s ease, background 0.2s ease"
          />
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="var(--bg-color)" borderRight="1px solid" borderColor="var(--border-color)">
          <DrawerHeader
            color="var(--text-color)"
            fontFamily="mono"
            fontSize="sm"
            fontWeight="700"
            letterSpacing="0.04em"
            borderBottom="1px solid"
            borderColor="var(--border-color)"
          >
            {t('nav.navigation')}
          </DrawerHeader>
          <DrawerBody pt={4}>
            <VStack align="stretch" spacing={3}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <ChakraLink
                    key={item.path}
                    as={Link}
                    to={item.path}
                    onClick={onClose}
                    fontFamily="mono"
                    fontSize="sm"
                    py={1}
                    color={isActive ? 'accent' : 'var(--secondary-text)'}
                    fontWeight={isActive ? 600 : 500}
                    _hover={{
                      textDecoration: 'none',
                      color: isActive ? 'accent' : 'var(--text-color)',
                    }}
                    transition="color 0.2s ease"
                  >
                    {t(item.labelKey)}
                  </ChakraLink>
                )
              })}

              <Divider borderColor="var(--border-color)" my={2} />

              <VStack align="stretch" spacing={2}>
                {socialLinks.map((link) => (
                  <ChakraLink
                    key={link.label}
                    href={link.href}
                    isExternal
                    fontFamily="mono"
                    fontSize="sm"
                    py={1}
                    color="var(--secondary-text)"
                    _hover={{
                      textDecoration: 'none',
                      color: 'var(--accent-color)',
                    }}
                    transition="color 0.2s ease"
                  >
                    <Box as={link.icon} mr={2} display="inline-block" /> {link.label}
                  </ChakraLink>
                ))}
              </VStack>

              <Divider borderColor="var(--border-color)" my={2} />

              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  color="var(--text-color)"
                  borderColor="var(--border-color)"
                  fontFamily="mono"
                  fontWeight="600"
                  onClick={toggleLanguage}
                  flex={1}
                  _hover={{ bg: 'var(--hover-color)', borderColor: 'var(--border-strong)' }}
                  transition="background 0.2s ease, border-color 0.2s ease"
                >
                  {i18n.language === 'zh' ? 'English' : '中文'}
                </Button>
                <IconButton
                  aria-label={t('aria.toggleColorMode')}
                  icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                  onClick={toggleColorMode}
                  variant="outline"
                  color="var(--text-color)"
                  borderColor="var(--border-color)"
                  _hover={{ bg: 'var(--hover-color)', borderColor: 'var(--border-strong)' }}
                  transition="background 0.2s ease, border-color 0.2s ease"
                />
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default Navbar
