import { describe, it, expect } from 'vitest'
import {
  isLinkMessage,
  isImageType,
  isVideoType,
  decideFileType,
} from '../src/utils/msgType'
import { mdiFileDocument } from '@mdi/js'

describe('msgType utilities', () => {
  describe('isLinkMessage', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(isLinkMessage('http://example.com')).toBe(true)
      expect(isLinkMessage('http://www.example.com')).toBe(true)
    })

    it('should return true for valid HTTPS URLs', () => {
      expect(isLinkMessage('https://example.com')).toBe(true)
      expect(isLinkMessage('https://www.example.com/path')).toBe(true)
    })

    it('should return true for FTP URLs', () => {
      expect(isLinkMessage('ftp://files.example.com')).toBe(true)
    })

    it('should return true for URLs with ports', () => {
      expect(isLinkMessage('http://example.com:8080')).toBe(true)
      expect(isLinkMessage('https://localhost:3000')).toBe(true)
    })

    it('should return true for URLs with query strings', () => {
      expect(isLinkMessage('https://example.com?param=value')).toBe(true)
      expect(isLinkMessage('https://example.com?a=1&b=2')).toBe(true)
    })

    it('should return true for URLs with fragments', () => {
      expect(isLinkMessage('https://example.com#section')).toBe(true)
      expect(isLinkMessage('https://example.com/page#anchor')).toBe(true)
    })

    it('should return false for plain text', () => {
      expect(isLinkMessage('hello world')).toBe(false)
      expect(isLinkMessage('This is a test')).toBe(false)
    })

    it('should return false for mailto links', () => {
      expect(isLinkMessage('mailto:test@example.com')).toBe(false)
    })

    it('should return false for invalid URLs', () => {
      expect(isLinkMessage('not a url')).toBe(false)
      expect(isLinkMessage('www.example.com')).toBe(false)
      expect(isLinkMessage('example.com')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isLinkMessage('')).toBe(false)
    })
  })

  describe('isImageType', () => {
    it('should return true for common image formats', () => {
      expect(isImageType('photo.png')).toBe(true)
      expect(isImageType('image.jpg')).toBe(true)
      expect(isImageType('picture.jpeg')).toBe(true)
      expect(isImageType('graphic.gif')).toBe(true)
    })

    it('should return true for additional image formats', () => {
      expect(isImageType('image.webp')).toBe(true)
      expect(isImageType('icon.svg')).toBe(true)
      expect(isImageType('bitmap.bmp')).toBe(true)
      expect(isImageType('photo.heic')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(isImageType('Photo.PNG')).toBe(true)
      expect(isImageType('IMAGE.JPG')).toBe(true)
      expect(isImageType('Picture.JPEG')).toBe(true)
    })

    it('should return false for non-image files', () => {
      expect(isImageType('document.pdf')).toBe(false)
      expect(isImageType('video.mp4')).toBe(false)
      expect(isImageType('audio.mp3')).toBe(false)
      expect(isImageType('text.txt')).toBe(false)
    })

    it('should handle files with multiple dots', () => {
      expect(isImageType('my.photo.png')).toBe(true)
      expect(isImageType('file.backup.jpg')).toBe(true)
    })
  })

  describe('isVideoType', () => {
    it('should return true for common video formats', () => {
      expect(isVideoType('video.mp4')).toBe(true)
      expect(isVideoType('movie.avi')).toBe(true)
      expect(isVideoType('clip.mov')).toBe(true)
    })

    it('should return true for additional video formats', () => {
      expect(isVideoType('video.mkv')).toBe(true)
      expect(isVideoType('stream.webm')).toBe(true)
      expect(isVideoType('old.wmv')).toBe(true)
      expect(isVideoType('clip.flv')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(isVideoType('Video.MP4')).toBe(true)
      expect(isVideoType('MOVIE.AVI')).toBe(true)
    })

    it('should return false for non-video files', () => {
      expect(isVideoType('audio.mp3')).toBe(false)
      expect(isVideoType('image.jpg')).toBe(false)
      expect(isVideoType('document.pdf')).toBe(false)
    })

    it('should handle files with multiple dots', () => {
      expect(isVideoType('my.video.mp4')).toBe(true)
      expect(isVideoType('file.backup.avi')).toBe(true)
    })
  })

  describe('decideFileType', () => {
    it('should return image icon for image files', () => {
      const imageIcon = decideFileType('photo.png')
      expect(imageIcon).toBeTruthy()
      expect(imageIcon).not.toBe(mdiFileDocument)
    })

    it('should return video icon for video files', () => {
      const videoIcon = decideFileType('movie.mp4')
      expect(videoIcon).toBeTruthy()
      expect(videoIcon).not.toBe(mdiFileDocument)
    })

    it('should return audio icon for audio files', () => {
      const audioIcon = decideFileType('song.mp3')
      expect(audioIcon).toBeTruthy()
      expect(audioIcon).not.toBe(mdiFileDocument)
    })

    it('should return document icon for Word files', () => {
      const docIcon = decideFileType('document.docx')
      expect(docIcon).toBeTruthy()
      expect(docIcon).not.toBe(mdiFileDocument)
    })

    it('should return spreadsheet icon for Excel files', () => {
      const excelIcon = decideFileType('spreadsheet.xlsx')
      expect(excelIcon).toBeTruthy()
      expect(excelIcon).not.toBe(mdiFileDocument)
    })

    it('should return presentation icon for PowerPoint files', () => {
      const pptIcon = decideFileType('presentation.pptx')
      expect(pptIcon).toBeTruthy()
      expect(pptIcon).not.toBe(mdiFileDocument)
    })

    it('should return code icon for code files', () => {
      const codeIcon = decideFileType('script.js')
      expect(codeIcon).toBeTruthy()
      expect(codeIcon).not.toBe(mdiFileDocument)
    })

    it('should return zip icon for compressed files', () => {
      const zipIcon = decideFileType('archive.zip')
      expect(zipIcon).toBeTruthy()
      expect(zipIcon).not.toBe(mdiFileDocument)
    })

    it('should return key icon for key files', () => {
      const keyIcon = decideFileType('certificate.key')
      expect(keyIcon).toBeTruthy()
      expect(keyIcon).not.toBe(mdiFileDocument)
    })

    it('should return CAD icon for CAD files', () => {
      const cadIcon = decideFileType('model.dwg')
      expect(cadIcon).toBeTruthy()
      expect(cadIcon).not.toBe(mdiFileDocument)
    })

    it('should return default icon for unknown file types', () => {
      expect(decideFileType('unknown.xyz')).toBe(mdiFileDocument)
      expect(decideFileType('file.unknown')).toBe(mdiFileDocument)
    })

    it('should be case-insensitive', () => {
      const lowerIcon = decideFileType('photo.png')
      const upperIcon = decideFileType('PHOTO.PNG')
      expect(lowerIcon).toBe(upperIcon)
    })

    it('should handle files without extensions', () => {
      expect(decideFileType('README')).toBe(mdiFileDocument)
      expect(decideFileType('Makefile')).toBe(mdiFileDocument)
    })
  })
})
