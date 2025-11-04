import { describe, it, expect } from 'vitest'
import { FileChunkManager } from '../src/utils/fileChunk'
import { TRANSFER_CONFIG } from '@/config/transferConfig'

describe('FileChunkManager', () => {
  describe('sliceFile', () => {
    it('should split a file into chunks', () => {
      // Create a file large enough to require multiple chunks
      const content = 'a'.repeat(TRANSFER_CONFIG.chunkSize * 3)
      const blob = new Blob([content])
      const file = new File([blob], 'test.txt', { type: 'text/plain' })

      const chunks = FileChunkManager.sliceFile(file)

      expect(chunks.length).toBeGreaterThan(1)
      expect(chunks[0]).toBeInstanceOf(Blob)
    })

    it('should handle small files that fit in one chunk', () => {
      const content = 'small file content'
      const file = new File([content], 'small.txt', { type: 'text/plain' })

      const chunks = FileChunkManager.sliceFile(file)

      expect(chunks.length).toBe(1)
    })

    it('should handle empty files', () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' })

      const chunks = FileChunkManager.sliceFile(file)

      expect(chunks.length).toBe(0)
    })
  })

  describe('calculateExpectedChunks', () => {
    it('should calculate correct number of chunks for exact multiples', () => {
      const fileSize = TRANSFER_CONFIG.chunkSize * 3

      const expected = FileChunkManager.calculateExpectedChunks(fileSize)

      expect(expected).toBe(3)
    })

    it('should round up for non-exact multiples', () => {
      const fileSize = TRANSFER_CONFIG.chunkSize * 2 + 100

      const expected = FileChunkManager.calculateExpectedChunks(fileSize)

      expect(expected).toBe(3)
    })

    it('should return 1 for small files', () => {
      const expected = FileChunkManager.calculateExpectedChunks(100)
      expect(expected).toBe(1)
    })

    it('should return 0 for zero-size files', () => {
      const expected = FileChunkManager.calculateExpectedChunks(0)
      expect(expected).toBe(0)
    })
  })

  describe('checkChunksComplete', () => {
    it('should return true when all chunks are present', () => {
      const chunks = [
        new ArrayBuffer(100),
        new ArrayBuffer(100),
        new ArrayBuffer(100),
      ]

      const result = FileChunkManager.checkChunksComplete(chunks, 3)

      expect(result).toBe(true)
    })

    it('should return false when chunks are missing', () => {
      const chunks = [new ArrayBuffer(100), new ArrayBuffer(100)]

      const result = FileChunkManager.checkChunksComplete(chunks, 3)

      expect(result).toBe(false)
    })

    it('should return false when there are gaps in chunks', () => {
      const chunks = new Array(3)
      chunks[0] = new ArrayBuffer(100)
      chunks[2] = new ArrayBuffer(100)

      const result = FileChunkManager.checkChunksComplete(chunks, 3)

      expect(result).toBe(false)
    })

    it('should return true for empty arrays with expected count 0', () => {
      const result = FileChunkManager.checkChunksComplete([], 0)
      expect(result).toBe(true)
    })
  })

  describe('findMissingChunks', () => {
    it('should find all missing chunks', () => {
      const chunks = new Array(5)
      chunks[0] = new ArrayBuffer(100)
      chunks[2] = new ArrayBuffer(100)
      chunks[4] = new ArrayBuffer(100)

      const missing = FileChunkManager.findMissingChunks(chunks, 5)

      expect(missing).toEqual([1, 3])
    })

    it('should return empty array when no chunks are missing', () => {
      const chunks = [
        new ArrayBuffer(100),
        new ArrayBuffer(100),
        new ArrayBuffer(100),
      ]

      const missing = FileChunkManager.findMissingChunks(chunks, 3)

      expect(missing).toEqual([])
    })

    it('should handle empty chunk array', () => {
      const missing = FileChunkManager.findMissingChunks([], 3)
      expect(missing).toEqual([0, 1, 2])
    })
  })

  describe('mergeChunks', () => {
    it('should merge chunks into a single Blob', () => {
      const chunks = [
        new TextEncoder().encode('Hello ').buffer,
        new TextEncoder().encode('World!').buffer,
      ]

      const blob = FileChunkManager.mergeChunks(chunks)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBe(12)
    })

    it('should handle empty chunks array', () => {
      const blob = FileChunkManager.mergeChunks([])
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBe(0)
    })
  })

  describe('mergeChunksWithType', () => {
    it('should merge chunks with specified MIME type', () => {
      const chunks = [new TextEncoder().encode('test').buffer]

      const blob = FileChunkManager.mergeChunksWithType(chunks, 'text/plain')

      expect(blob.type).toBe('text/plain')
    })

    it('should handle binary data', () => {
      const chunks = [new Uint8Array([1, 2, 3, 4]).buffer]

      const blob = FileChunkManager.mergeChunksWithType(
        chunks,
        'application/octet-stream',
      )

      expect(blob.type).toBe('application/octet-stream')
      expect(blob.size).toBe(4)
    })
  })

  describe('calculateReceivedSize', () => {
    it('should calculate total size of received chunks', () => {
      const chunks = [
        new ArrayBuffer(100),
        new ArrayBuffer(200),
        new ArrayBuffer(150),
      ]

      const size = FileChunkManager.calculateReceivedSize(chunks)

      expect(size).toBe(450)
    })

    it('should handle chunks with gaps', () => {
      const chunks = new Array(3)
      chunks[0] = new ArrayBuffer(100)
      chunks[2] = new ArrayBuffer(100)

      const size = FileChunkManager.calculateReceivedSize(chunks)

      expect(size).toBe(200)
    })

    it('should return 0 for empty array', () => {
      const size = FileChunkManager.calculateReceivedSize([])
      expect(size).toBe(0)
    })
  })

  describe('generateFileId', () => {
    it('should generate a unique file ID', () => {
      const id = FileChunkManager.generateFileId('test.txt', 1024)

      expect(id).toContain('test.txt')
      expect(id).toContain('1024')
    })

    it('should generate different IDs for different files', () => {
      const id1 = FileChunkManager.generateFileId('file1.txt', 100)
      const id2 = FileChunkManager.generateFileId('file2.txt', 100)

      expect(id1).not.toBe(id2)
    })

    it('should use provided timestamp if given', () => {
      const timestamp = 1234567890
      const id = FileChunkManager.generateFileId('test.txt', 1024, timestamp)

      expect(id).toContain(timestamp.toString())
    })

    it('should handle special characters in filename', () => {
      const id = FileChunkManager.generateFileId('test file (1).txt', 1024)

      expect(id).toContain('test file (1).txt')
    })
  })

  describe('validateChunkIntegrity', () => {
    it('should return true when sizes match', () => {
      const chunks = [new ArrayBuffer(100), new ArrayBuffer(100)]

      const isValid = FileChunkManager.validateChunkIntegrity(chunks, 200)

      expect(isValid).toBe(true)
    })

    it("should return false when sizes don't match", () => {
      const chunks = [new ArrayBuffer(100), new ArrayBuffer(100)]

      const isValid = FileChunkManager.validateChunkIntegrity(chunks, 250)

      expect(isValid).toBe(false)
    })

    it('should handle empty chunks', () => {
      const isValid = FileChunkManager.validateChunkIntegrity([], 0)
      expect(isValid).toBe(true)
    })
  })
})
