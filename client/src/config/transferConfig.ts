export const TRANSFER_CONFIG = {
  // Retry configuration
  maxRetries: 3,
  timeoutMs: 10000, // 10 second timeout

  // Chunk configuration
  chunkSize: 65536 - 256, // 64KB chunk size (minus header overhead)
  maxChunkHeaderSize: 256, // Maximum chunk header size

  // Protocol prefix
  metaPrefix: 'CONTENT_META',
  retryPrefix: 'RETRY_REQUEST',

  // Check interval
  timeoutCheckInterval: 2000, // Check timeout every 2 seconds

  // Buffer configuration
  maxBufferedAmount: 16777216, // 16MB
} as const

export type TransferType = 'TRANSFER_TYPE_FILE' | 'TRANSFER_TYPE_TEXT'
export type MetaType = 's' | 't' | 'n' | 'i' // size, type, name, id
