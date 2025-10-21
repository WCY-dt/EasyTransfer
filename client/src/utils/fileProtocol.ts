import { TRANSFER_CONFIG } from '@/config/transferConfig'
import type {
  ProtocolMessage,
  ChunkData,
  RetryData,
} from '@/types/fileTransfer'

export class FileProtocol {
  private static metaPrefixBytes = new TextEncoder().encode(
    TRANSFER_CONFIG.metaPrefix,
  )
  private static retryPrefixBytes = new TextEncoder().encode(
    TRANSFER_CONFIG.retryPrefix,
  )

  /**
   * Check message type
   */
  static parseMessage(data: ArrayBuffer): ProtocolMessage {
    const dataView = new DataView(data)

    // Check if it's a metadata message
    if (this.hasPrefix(dataView, this.metaPrefixBytes)) {
      const decodedData = new TextDecoder().decode(data)
      const metaData = decodedData.slice(TRANSFER_CONFIG.metaPrefix.length)
      return { type: 'meta', data: metaData }
    }

    // Check if it's a retry request message
    if (this.hasPrefix(dataView, this.retryPrefixBytes)) {
      const decodedData = new TextDecoder().decode(data)
      const retryData = decodedData.slice(TRANSFER_CONFIG.retryPrefix.length)
      return { type: 'retry', data: retryData }
    }

    // Otherwise it's a file content message
    return { type: 'content', data }
  }

  /**
   * Parse file content chunk
   */
  static parseFileChunk(data: ArrayBuffer): ChunkData {
    const dataView = new DataView(data)

    // Read file ID length
    const fileIdLength = dataView.getUint16(0, false)

    // Read file ID
    const fileIdBytes = new Uint8Array(data, 2, fileIdLength)
    const fileId = new TextDecoder().decode(fileIdBytes)

    // Read chunk index
    const chunkIdxOffset = 2 + fileIdLength
    const chunkIndex = dataView.getUint16(chunkIdxOffset, false)

    // Read chunk data
    const chunkData = data.slice(chunkIdxOffset + 2)

    return {
      fileId,
      chunkIndex,
      data: chunkData,
    }
  }

  /**
   * Encode file chunk
   */
  static encodeFileChunk(
    fileId: string,
    chunkIndex: number,
    chunkData: ArrayBuffer,
  ): Uint8Array {
    const fileIdBytes = new TextEncoder().encode(fileId)

    // File ID length (2 bytes)
    const fileIdLengthArray = new Uint8Array(2)
    fileIdLengthArray[0] = (fileIdBytes.length & 0xff00) >> 8
    fileIdLengthArray[1] = fileIdBytes.length & 0xff

    // Chunk index (2 bytes)
    const chunkIndexArray = new Uint8Array(2)
    chunkIndexArray[0] = (chunkIndex & 0xff00) >> 8
    chunkIndexArray[1] = chunkIndex & 0xff

    // Combine data: [fileId length] + [fileId] + [chunk index] + [chunk data]
    const totalLength = 2 + fileIdBytes.length + 2 + chunkData.byteLength
    const encodedData = new Uint8Array(totalLength)

    let offset = 0
    encodedData.set(fileIdLengthArray, offset)
    offset += 2
    encodedData.set(fileIdBytes, offset)
    offset += fileIdBytes.length
    encodedData.set(chunkIndexArray, offset)
    offset += 2
    encodedData.set(new Uint8Array(chunkData), offset)

    return encodedData
  }

  /**
   * Encodes a metadata message
   */
  static encodeMetaMessage(type: string, value: string): Uint8Array {
    const message = TRANSFER_CONFIG.metaPrefix + type + value
    return new TextEncoder().encode(message)
  }

  /**
   * Encodes a retry request message
   */
  static encodeRetryMessage(retryData: RetryData): ArrayBuffer {
    const message = TRANSFER_CONFIG.retryPrefix + JSON.stringify(retryData)
    const encoder = new TextEncoder()
    const encoded = encoder.encode(message)
    return (encoded.buffer as ArrayBuffer).slice(
      encoded.byteOffset,
      encoded.byteOffset + encoded.byteLength,
    )
  }

  /**
   * Parses retry request data
   */
  static parseRetryData(data: string): RetryData | null {
    try {
      return JSON.parse(data) as RetryData
    } catch (error) {
      console.error('[ERR] Failed to parse retry data:', error)
      return null
    }
  }

  /**
   * Checks if the data has the specified prefix
   */
  private static hasPrefix(
    dataView: DataView,
    prefixBytes: Uint8Array,
  ): boolean {
    if (dataView.byteLength < prefixBytes.length) {
      return false
    }

    for (let i = 0; i < prefixBytes.length; i++) {
      if (dataView.getUint8(i) !== prefixBytes[i]) {
        return false
      }
    }
    return true
  }
}
