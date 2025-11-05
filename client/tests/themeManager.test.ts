import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { applyTheme } from '../src/utils/themeManager'

describe('themeManager', () => {
  let rootElement: HTMLElement

  beforeEach(() => {
    rootElement = document.documentElement
    // Clear any existing styles
    rootElement.style.cssText = ''
  })

  afterEach(() => {
    rootElement.style.cssText = ''
  })

  describe('applyTheme', () => {
    it('should apply light theme colors', () => {
      applyTheme('light')

      expect(rootElement.style.getPropertyValue('--primary-color')).toBe(
        '#007bff',
      )
      expect(rootElement.style.getPropertyValue('--light-color')).toBe(
        '#f8f9fa',
      )
      expect(rootElement.style.getPropertyValue('--dark-color')).toBe('#343a40')
    })

    it('should apply dark theme colors', () => {
      applyTheme('dark')

      expect(rootElement.style.getPropertyValue('--primary-color')).toBe(
        '#007bff',
      )
      expect(rootElement.style.getPropertyValue('--light-color')).toBe(
        '#1a202c',
      )
      expect(rootElement.style.getPropertyValue('--dark-color')).toBe('#e2e8f0')
    })

    it('should apply auto theme based on system preference (dark)', () => {
      // Mock window.matchMedia to return dark preference
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      window.matchMedia = matchMediaMock

      applyTheme('auto')

      expect(rootElement.style.getPropertyValue('--light-color')).toBe(
        '#1a202c',
      )
    })

    it('should apply auto theme based on system preference (light)', () => {
      // Mock window.matchMedia to return light preference
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      window.matchMedia = matchMediaMock

      applyTheme('auto')

      expect(rootElement.style.getPropertyValue('--light-color')).toBe(
        '#f8f9fa',
      )
    })

    it('should apply all required CSS variables for light theme', () => {
      applyTheme('light')

      const requiredVars = [
        '--primary-color',
        '--primary-semi-dark-color',
        '--primary-dark-color',
        '--primary-semi-light-color',
        '--primary-light-color',
        '--primary-extra-light-color',
        '--primary-blur-color',
        '--secondary-color',
        '--secondary-light-color',
        '--secondary-extra-light-color',
        '--success-color',
        '--success-dark-color',
        '--success-semi-light-color',
        '--success-light-color',
        '--error-color',
        '--light-color',
        '--light-blur-color',
        '--dark-color',
        '--gold-color',
        '--gold-light-color',
      ]

      requiredVars.forEach(varName => {
        const value = rootElement.style.getPropertyValue(varName)
        expect(value).toBeTruthy()
        expect(value.length).toBeGreaterThan(0)
      })
    })

    it('should apply all required CSS variables for dark theme', () => {
      applyTheme('dark')

      const requiredVars = [
        '--primary-color',
        '--primary-semi-dark-color',
        '--primary-dark-color',
        '--primary-semi-light-color',
        '--primary-light-color',
        '--primary-extra-light-color',
        '--primary-blur-color',
        '--secondary-color',
        '--secondary-light-color',
        '--secondary-extra-light-color',
        '--success-color',
        '--success-dark-color',
        '--success-semi-light-color',
        '--success-light-color',
        '--error-color',
        '--light-color',
        '--light-blur-color',
        '--dark-color',
        '--gold-color',
        '--gold-light-color',
      ]

      requiredVars.forEach(varName => {
        const value = rootElement.style.getPropertyValue(varName)
        expect(value).toBeTruthy()
        expect(value.length).toBeGreaterThan(0)
      })
    })

    it('should have different light and dark colors', () => {
      applyTheme('light')
      const lightBackgroundColor =
        rootElement.style.getPropertyValue('--light-color')

      applyTheme('dark')
      const darkBackgroundColor =
        rootElement.style.getPropertyValue('--light-color')

      expect(lightBackgroundColor).not.toBe(darkBackgroundColor)
    })

    it('should overwrite previous theme when called multiple times', () => {
      applyTheme('light')
      const lightColor = rootElement.style.getPropertyValue('--light-color')

      applyTheme('dark')
      const darkColor = rootElement.style.getPropertyValue('--light-color')

      expect(lightColor).not.toBe(darkColor)
      expect(darkColor).toBe('#1a202c')
    })

    it('should apply colors with correct format (hex)', () => {
      applyTheme('light')

      const primaryColor = rootElement.style.getPropertyValue('--primary-color')
      expect(primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('should handle rapid theme changes', () => {
      expect(() => {
        applyTheme('light')
        applyTheme('dark')
        applyTheme('auto')
        applyTheme('light')
      }).not.toThrow()
    })

    it('should maintain consistent primary color across themes', () => {
      applyTheme('light')
      const lightPrimary = rootElement.style.getPropertyValue('--primary-color')

      applyTheme('dark')
      const darkPrimary = rootElement.style.getPropertyValue('--primary-color')

      // Primary color should be the same for consistency
      expect(lightPrimary).toBe(darkPrimary)
      expect(lightPrimary).toBe('#007bff')
    })

    it('should have contrasting light and dark colors for accessibility', () => {
      applyTheme('light')
      const lightTextColor = rootElement.style.getPropertyValue('--dark-color')
      const lightBgColor = rootElement.style.getPropertyValue('--light-color')

      expect(lightTextColor).toBe('#343a40') // Dark text
      expect(lightBgColor).toBe('#f8f9fa') // Light background

      applyTheme('dark')
      const darkTextColor = rootElement.style.getPropertyValue('--dark-color')
      const darkBgColor = rootElement.style.getPropertyValue('--light-color')

      expect(darkTextColor).toBe('#e2e8f0') // Light text
      expect(darkBgColor).toBe('#1a202c') // Dark background
    })

    it('should apply blur colors with transparency', () => {
      applyTheme('light')

      const primaryBlur = rootElement.style.getPropertyValue(
        '--primary-blur-color',
      )
      const lightBlur = rootElement.style.getPropertyValue('--light-blur-color')

      // Check that blur colors contain transparency indicator
      expect(primaryBlur).toContain('4f')
      expect(lightBlur).toContain('4f')
    })

    it('should apply success colors correctly', () => {
      applyTheme('light')

      const successColor = rootElement.style.getPropertyValue('--success-color')
      const successDark = rootElement.style.getPropertyValue(
        '--success-dark-color',
      )
      const successLight = rootElement.style.getPropertyValue(
        '--success-light-color',
      )

      expect(successColor).toBe('#28a745')
      expect(successDark).toBe('#218838')
      expect(successLight).toBe('#d4edda')
    })

    it('should apply error color correctly', () => {
      applyTheme('light')
      const errorColor = rootElement.style.getPropertyValue('--error-color')
      expect(errorColor).toBe('#dc3545')

      applyTheme('dark')
      const errorColorDark = rootElement.style.getPropertyValue('--error-color')
      expect(errorColorDark).toBe('#f05252')
    })

    it('should apply gold colors correctly', () => {
      applyTheme('light')
      const goldColor = rootElement.style.getPropertyValue('--gold-color')
      const goldLight = rootElement.style.getPropertyValue('--gold-light-color')

      expect(goldColor).toBe('#ffc107')
      expect(goldLight).toBe('#ffcd27')
    })

    it('should apply secondary colors correctly', () => {
      applyTheme('light')
      const secondaryColor =
        rootElement.style.getPropertyValue('--secondary-color')
      const secondaryLight = rootElement.style.getPropertyValue(
        '--secondary-light-color',
      )

      expect(secondaryColor).toBe('#6c757d')
      expect(secondaryLight).toBe('#f0f0f0')

      applyTheme('dark')
      const secondaryColorDark =
        rootElement.style.getPropertyValue('--secondary-color')
      const secondaryLightDark = rootElement.style.getPropertyValue(
        '--secondary-light-color',
      )

      expect(secondaryColorDark).toBe('#b8c2cc')
      expect(secondaryLightDark).toBe('#4a5568')
    })
  })
})
