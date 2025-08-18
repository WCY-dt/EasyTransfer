import { TRANSFER_CONFIG } from '@/config/transferConfig'

export class FileChunkManager {
  /**
   * Splits a file into chunks
   */
  static sliceFile(file: File): Blob[] {
    const slices: Blob[] = []
    let offset = 0
    const chunkSize = TRANSFER_CONFIG.chunkSize

    while (offset < file.size) {
      const slice = file.slice(offset, offset + chunkSize)
      slices.push(slice)
      offset += chunkSize
    }

    return slices
  }

  /**
   * Calculates the expected number of chunks for a file
   */
  static calculateExpectedChunks(fileSize: number): number {
    return Math.ceil(fileSize / TRANSFER_CONFIG.chunkSize)
  }

  /**
   * Checks if all chunks are complete
   */
  static checkChunksComplete(
    chunks: ArrayBuffer[],
    expectedCount: number,
  ): boolean {
    if (chunks.length < expectedCount) {
      return false
    }

    for (let i = 0; i < expectedCount; i++) {
      if (!chunks[i]) {
        return false
      }
    }

    return true
  }

  /**
   * Finds the indices of missing chunks
   */
  static findMissingChunks(
    chunks: ArrayBuffer[],
    expectedCount: number,
  ): number[] {
    const missingChunks: number[] = []

    for (let i = 0; i < expectedCount; i++) {
      if (!chunks[i]) {
        missingChunks.push(i)
      }
    }

    return missingChunks
  }

  /**
   * Merges chunks into a Blob
   */
  static mergeChunks(chunks: ArrayBuffer[]): Blob {
    return new Blob(chunks)
  }

  /**
   * Merges chunks into a Blob of a specific type
   */
  static mergeChunksWithType(chunks: ArrayBuffer[], mimeType: string): Blob {
    return new Blob(chunks, { type: mimeType })
  }

  /**
   * Calculates the received data size
   */
  static calculateReceivedSize(chunks: ArrayBuffer[]): number {
    return chunks.reduce((total, chunk) => {
      return total + (chunk ? chunk.byteLength : 0)
    }, 0)
  }

  /**
   * Generates a unique identifier for the file
   */
  static generateFileId(
    fileName: string,
    fileSize: number,
    timestamp?: number,
  ): string {
    const ts = timestamp || Date.now()
    return `${fileName}_${fileSize}_${ts}`
  }

  /**
   * Validates chunk integrity
   */
  static validateChunkIntegrity(
    chunks: ArrayBuffer[],
    expectedSize: number,
  ): boolean {
    const actualSize = this.calculateReceivedSize(chunks)
    return actualSize === expectedSize
  }
}
