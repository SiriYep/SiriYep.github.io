import {
  Flex,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useColorModeValue,
  useMediaQuery,
  type ResponsiveValue,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type LogoSize = 'xs' | 'sm' | 'md'

interface InstitutionLogoProps {
  src?: string
  label: string
  fallback?: ReactNode
  size?: LogoSize
  framed?: boolean
}

const dimensions: Record<LogoSize, {
  width: string
  height: string
  mark: string
  fallback: string
  wordmarkViewport: string
  wordmarkCanvas: string
  fontSize: ResponsiveValue<string>
}> = {
  xs: { width: '32px', height: '24px', mark: '22px', fallback: '20px', wordmarkViewport: '14px', wordmarkCanvas: '46px', fontSize: '2xs' },
  sm: { width: '42px', height: '32px', mark: '30px', fallback: '26px', wordmarkViewport: '18px', wordmarkCanvas: '61px', fontSize: 'xs' },
  md: { width: '52px', height: '40px', mark: '38px', fallback: '30px', wordmarkViewport: '22px', wordmarkCanvas: '76px', fontSize: 'sm' },
}

/**
 * A borderless logo slot that preserves each asset's natural aspect ratio.
 * The fixed slot aligns adjacent copy without forcing the artwork into a
 * square badge, so both institution marks and horizontal wordmarks fit.
 */
const InstitutionLogo = ({
  src,
  label,
  fallback,
  size = 'sm',
  framed = false,
}: InstitutionLogoProps) => {
  const { t } = useTranslation()
  const [canHover] = useMediaQuery('(hover: hover) and (pointer: fine)', {
    ssr: true,
    fallback: false,
  })
  const metric = dimensions[size]
  const resolvedSrc = src
  const previewBg = useColorModeValue('rgba(255, 254, 251, 0.94)', 'rgba(26, 25, 32, 0.94)')
  const previewBorder = useColorModeValue('rgba(76, 66, 43, 0.24)', 'rgba(160, 158, 180, 0.28)')
  const accessibleLabel = t('aria.previewLogo', {
    name: label,
    defaultValue: 'Preview {{name}} logo',
  })
  // These legacy assets contain a horizontal wordmark centered inside a large
  // square canvas. Crop only the empty canvas at display time so the original
  // brand artwork remains untouched and readable at compact UI sizes.
  const isPaddedWordmark = /\/baai\.jpe?g(?:[?#]|$)/i.test(resolvedSrc ?? '')

  const compactLogo = (
    <Flex
      w={metric.width}
      h={metric.height}
      align="center"
      justify="center"
      flexShrink={0}
      overflow="hidden"
    >
      {resolvedSrc && isPaddedWordmark ? (
        <Flex
          w="full"
          h={metric.wordmarkViewport}
          position="relative"
          align="center"
          justify="center"
          overflow="hidden"
          borderRadius={framed ? '5px' : '2px'}
          outline={framed ? '1px solid var(--border-strong)' : undefined}
          outlineOffset={framed ? '-1px' : undefined}
          boxShadow={framed ? 'var(--shadow-sm)' : undefined}
        >
          <Image
            src={resolvedSrc}
            alt=""
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            w={metric.wordmarkCanvas}
            h={metric.wordmarkCanvas}
            maxW="none"
            maxH="none"
            objectFit="cover"
            objectPosition="center"
            borderRadius={framed ? '5px' : '2px'}
          />
        </Flex>
      ) : resolvedSrc ? (
        <Image
          src={resolvedSrc}
          alt=""
          w="auto"
          h="auto"
          maxW="full"
          maxH={metric.mark}
          objectFit="contain"
          objectPosition="center"
          borderRadius={framed ? '5px' : '2px'}
          outline={framed ? '1px solid var(--border-strong)' : undefined}
          outlineOffset={framed ? '-1px' : undefined}
          boxShadow={framed ? 'var(--shadow-sm)' : undefined}
        />
      ) : fallback ? (
        <Flex
          w={metric.fallback}
          h={metric.fallback}
          align="center"
          justify="center"
          borderRadius="full"
          bg="var(--hover-color)"
          color="textSecondary"
          outline={framed ? '1px solid var(--border-strong)' : undefined}
          outlineOffset={framed ? '-1px' : undefined}
          boxShadow={framed ? 'var(--shadow-sm)' : undefined}
        >
          <Text as="span" fontSize={metric.fontSize} fontWeight="semibold" lineHeight="1" aria-hidden="true">
            {fallback}
          </Text>
        </Flex>
      ) : null}
    </Flex>
  )

  if (!resolvedSrc) return compactLogo

  return (
    <Popover
      trigger={canHover ? 'hover' : 'click'}
      placement="left"
      strategy="fixed"
      gutter={10}
      openDelay={90}
      closeDelay={120}
      isLazy
      autoFocus={false}
      closeOnBlur
      closeOnEsc
    >
      <PopoverTrigger>
        <Flex
          as="button"
          type="button"
          align="center"
          justify="center"
          flexShrink={0}
          appearance="none"
          p={0}
          m={0}
          bg="transparent"
          border="0"
          borderRadius="6px"
          cursor="zoom-in"
          aria-label={accessibleLabel}
          _focusVisible={{ outline: '2px solid', outlineColor: 'accent', outlineOffset: '2px' }}
        >
          {compactLogo}
        </Flex>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          w="232px"
          maxW="calc(100vw - 24px)"
          bg={previewBg}
          border="1px solid"
          borderColor={previewBorder}
          borderRadius="16px"
          boxShadow="0 20px 55px rgba(0, 0, 0, 0.26), 0 4px 16px rgba(0, 0, 0, 0.12)"
          zIndex={1600}
          pointerEvents="none"
          sx={{
            backdropFilter: 'blur(18px) saturate(145%)',
            WebkitBackdropFilter: 'blur(18px) saturate(145%)',
          }}
          _focus={{ outline: 'none' }}
        >
          <PopoverArrow bg={previewBg} />
          <PopoverBody p={3}>
            <Flex
              w="full"
              minH="184px"
              align="center"
              justify="center"
              overflow="hidden"
              bg="white"
              border="1px solid"
              borderColor="blackAlpha.200"
              borderRadius="12px"
            >
              {resolvedSrc ? (
                isPaddedWordmark ? (
                  <Flex w="204px" h="72px" align="center" justify="center" overflow="hidden">
                    <Image
                      src={resolvedSrc}
                      alt=""
                      w="220px"
                      h="220px"
                      maxW="none"
                      maxH="none"
                      objectFit="cover"
                      objectPosition="center"
                    />
                  </Flex>
                ) : (
                  <Image
                    src={resolvedSrc}
                    alt=""
                    w="auto"
                    h="auto"
                    maxW="184px"
                    maxH="160px"
                    objectFit="contain"
                    objectPosition="center"
                    borderRadius="8px"
                  />
                )
              ) : (
                <Flex
                  w="112px"
                  h="112px"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="gray.100"
                  color="gray.700"
                >
                  <Text as="span" fontSize="4xl" fontWeight="semibold" lineHeight="1" aria-hidden="true">
                    {fallback}
                  </Text>
                </Flex>
              )}
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

export default InstitutionLogo
