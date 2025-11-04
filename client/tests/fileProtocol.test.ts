import { describe, it, expect } from 'vitest'
import { FileProtocol } from '../src/utils/fileProtocol'
import { TRANSFER_CONFIG } from '@/config/transferConfig'
import type { RetryData } from '@/types/fileTransfer'

describe('FileProtocol', () => {
  describe('parseMessage', () => {
    it('should identify metadata messages', () => {
      const metaContent = 'stest.txt'
      const message = TRANSFER_CONFIG.metaPrefix + metaContent
      const encoded = new TextEncoder().encode(message)

      const result = FileProtocol.parseMessage(encoded.buffer)

      expect(result.type).toBe('meta')
      expect(result.data).toBe(metaContent)
    })

    it('should identify retry request messages', () => {
      const retryData: RetryData = {
        fileId: 'test123',
        fileName: 'test.txt',
        missingChunks: [1, 2, 3],
      }
      const message = TRANSFER_CONFIG.retryPrefix + JSON.stringify(retryData)
      const encoded = new TextEncoder().encode(message)

      const result = FileProtocol.parseMessage(encoded.buffer)

      expect(result.type).toBe('retry')
      expect(result.data).toBe(JSON.stringify(retryData))
    })

    it('should identify content messages', () => {
      const content = new Uint8Array([1, 2, 3, 4, 5])

      const result = FileProtocol.parseMessage(content.buffer)

      expect(result.type).toBe('content')
      expect(result.data).toBe(content.buffer)
    })

    it('should handle empty buffers as content', () => {
      const content = new Uint8Array([])

      const result = FileProtocol.parseMessage(content.buffer)

      expect(result.type).toBe('content')
    })
  })

  describe('parseFileChunk', () => {
    it('should parse file chunk data correctly', () => {
      const fileId = 'test_file_123'
      const chunkIndex = 5
      const chunkData = new Uint8Array([10, 20, 30, 40, 50])

      const encoded = FileProtocol.encodeFileChunk(
        fileId,
        chunkIndex,
        chunkData.buffer,
      )

      const result = FileProtocol.parseFileChunk(encoded.buffer)

      expect(result.fileId).toBe(fileId)
      expect(result.chunkIndex).toBe(chunkIndex)
      expect(new Uint8Array(result.data)).toEqual(chunkData)
    })

    it('should handle long file IDs', () => {
      const fileId = 'a'.repeat(255)
      const chunkIndex = 100
      const chunkData = new Uint8Array([1, 2, 3])

      const encoded = FileProtocol.encodeFileChunk(
        fileId,
        chunkIndex,
        chunkData.buffer,
      )

      const result = FileProtocol.parseFileChunk(encoded.buffer)

      expect(result.fileId).toBe(fileId)
      expect(result.chunkIndex).toBe(chunkIndex)
    })

    it('should handle empty chunk data', () => {
      const fileId = 'test'
      const chunkIndex = 0
      const chunkData = new Uint8Array([])

      const encoded = FileProtocol.encodeFileChunk(
        fileId,
        chunkIndex,
        chunkData.buffer,
      )

      const result = FileProtocol.parseFileChunk(encoded.buffer)

      expect(result.fileId).toBe(fileId)
      expect(result.chunkIndex).toBe(chunkIndex)
      expect(result.data.byteLength).toBe(0)
    })

    it('should handle maximum chunk index', () => {
      const fileId = 'test'
      const chunkIndex = 65535 // Max for uint16
      const chunkData = new Uint8Array([1])

      const encoded = FileProtocol.encodeFileChunk(
        fileId,
        chunkIndex,
        chunkData.buffer,
      )

      const result = FileProtocol.parseFileChunk(encoded.buffer)

      expect(result.chunkIndex).toBe(chunkIndex)
    })
  })

  describe('encodeFileChunk', () => {
    it('should encode file chunk with correct structure', () => {
      const fileId = 'test123'
      const chunkIndex = 42
      const chunkData = new Uint8Array([100, 200])

      const encoded = FileProtocol.encodeFileChunk(
        fileId,
        chunkIndex,
        chunkData.buffer,
      )

      // Verify structure: [2 bytes fileId length] + [fileId] + [2 bytes chunk index] + [data]
      const expectedLength = 2 + fileId.length + 2 + chunkData.length
      expect(encoded.length).toBe(expectedLength)

      // Verify fileId length
      const fileIdLength = (encoded[0] << 8) | encoded[1]
      expect(fileIdLength).toBe(fileId.length)

      // Verify chunk index
      const indexOffset = 2 + fileId.length
      const readChunkIndex =
        (encoded[indexOffset] << 8) | encoded[indexOffset + 1]
      expect(readChunkIndex).toBe(chunkIndex)
    })

    it('should handle various chunk data sizes', () => {
      const fileId = 'test'
      const testSizes = [0, 1, 100, 1000, TRANSFER_CONFIG.chunkSize]

      testSizes.forEach(size => {
        const chunkData = new Uint8Array(size)
        const encoded = FileProtocol.encodeFileChunk(
          fileId,
          0,
          chunkData.buffer,
        )

        expect(encoded.length).toBe(2 + fileId.length + 2 + size)
      })
    })
  })

  describe('encodeMetaMessage', () => {
    it('should encode metadata message with prefix', () => {
      const type = 's'
      const value = '1024'

      const encoded = FileProtocol.encodeMetaMessage(type, value)
      const decoded = new TextDecoder().decode(encoded)

      expect(decoded).toBe(TRANSFER_CONFIG.metaPrefix + type + value)
    })

    it('should handle various metadata types', () => {
      const metaTypes = [
        { type: 's', value: '1024' },
        { type: 't', value: 'TRANSFER_TYPE_FILE' },
        { type: 'n', value: 'test.txt' },
        { type: 'i', value: 'file_123' },
      ]

      metaTypes.forEach(({ type, value }) => {
        const encoded = FileProtocol.encodeMetaMessage(type, value)
        const decoded = new TextDecoder().decode(encoded)

        expect(decoded).toContain(TRANSFER_CONFIG.metaPrefix)
        expect(decoded).toContain(type)
        expect(decoded).toContain(value)
      })
    })

    it('should handle empty values', () => {
      const encoded = FileProtocol.encodeMetaMessage('s', '')
      const decoded = new TextDecoder().decode(encoded)

      expect(decoded).toBe(TRANSFER_CONFIG.metaPrefix + 's')
    })

    it('should handle special characters in values', () => {
      const specialValue = 'file name (1) [test].txt'
      const encoded = FileProtocol.encodeMetaMessage('n', specialValue)
      const decoded = new TextDecoder().decode(encoded)

      expect(decoded).toContain(specialValue)
    })
  })

  describe('encodeRetryMessage', () => {
    it('should encode retry data with prefix', () => {
      const retryData: RetryData = {
        fileId: 'test123',
        fileName: 'test.txt',
        missingChunks: [1, 2, 3],
      }

      const encoded = FileProtocol.encodeRetryMessage(retryData)
      const decoded = new TextDecoder().decode(encoded)

      expect(decoded).toContain(TRANSFER_CONFIG.retryPrefix)
      expect(decoded).toContain(JSON.stringify(retryData))
    })

    it('should handle empty missing chunks', () => {
      const retryData: RetryData = {
        fileId: 'test',
        fileName: 'file.txt',
        missingChunks: [],
      }

      const encoded = FileProtocol.encodeRetryMessage(retryData)
      const decoded = new TextDecoder().decode(encoded)

      expect(decoded).toContain('"missingChunks":[]')
    })

    it('should handle large missing chunk arrays', () => {
      const missingChunks = Array.from({ length: 1000 }, (_, i) => i)
      const retryData: RetryData = {
        fileId: 'test',
        fileName: 'file.txt',
        missingChunks,
      }

      const encoded = FileProtocol.encodeRetryMessage(retryData)
      const decoded = new TextDecoder().decode(encoded)

      expect(decoded).toContain(TRANSFER_CONFIG.retryPrefix)
      const parsedData = JSON.parse(
        decoded.slice(TRANSFER_CONFIG.retryPrefix.length),
      )
      expect(parsedData.missingChunks).toHaveLength(1000)
    })
  })

  describe('parseRetryData', () => {
    it('should parse valid retry data', () => {
      const retryData: RetryData = {
        fileId: 'test123',
        fileName: 'test.txt',
        missingChunks: [1, 2, 3],
      }
      const jsonString = JSON.stringify(retryData)

      const result = FileProtocol.parseRetryData(jsonString)

      expect(result).toEqual(retryData)
    })

    it('should return null for invalid JSON', () => {
      const invalidJson = 'not valid json {'

      const result = FileProtocol.parseRetryData(invalidJson)

      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = FileProtocol.parseRetryData('')

      expect(result).toBeNull()
    })

    it('should handle retry data with empty arrays', () => {
      const retryData: RetryData = {
        fileId: 'test',
        fileName: 'file.txt',
        missingChunks: [],
      }
      const jsonString = JSON.stringify(retryData)

      const result = FileProtocol.parseRetryData(jsonString)

      expect(result).toEqual(retryData)
    })
  })

  describe('round-trip encoding/decoding', () => {
    it('should correctly round-trip file chunks', () => {
      const fileId = 'roundtrip_test'
      const chunkIndex = 99
      const originalData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

      const encoded = FileProtocol.encodeFileChunk(
        fileId,
        chunkIndex,
        originalData.buffer,
      )
      const decoded = FileProtocol.parseFileChunk(encoded.buffer)

      expect(decoded.fileId).toBe(fileId)
      expect(decoded.chunkIndex).toBe(chunkIndex)
      expect(new Uint8Array(decoded.data)).toEqual(originalData)
    })

    it('should correctly round-trip retry messages', () => {
      const retryData: RetryData = {
        fileId: 'retry_test',
        fileName: 'test.txt',
        missingChunks: [5, 10, 15],
      }

      const encoded = FileProtocol.encodeRetryMessage(retryData)
      const message = FileProtocol.parseMessage(encoded)
      const parsed = FileProtocol.parseRetryData(message.data as string)

      expect(parsed).toEqual(retryData)
    })

    it('should correctly round-trip metadata messages', () => {
      const type = 'n'
      const value = 'important_file.txt'

      const encoded = FileProtocol.encodeMetaMessage(type, value)
      const message = FileProtocol.parseMessage(encoded.buffer)

      expect(message.type).toBe('meta')
      expect(message.data).toBe(type + value)
    })
  })
})
