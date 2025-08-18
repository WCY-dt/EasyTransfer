export interface FileReceiveState {
  id: string
  type: string
  name: string
  size: number
  progress: number
  url: string
  receivedChunks: ArrayBuffer[]
  isComplete: boolean
  arrayIndex: number // Index in downloadFileItems
  expectedChunks: number // Expected total number of chunks
  missingChunks: Set<number> // Missing chunk indices
  retryCount: number // Retry count
  lastActivity: number // Last activity time
}

export interface SentFileInfo {
  file: File
  type: string
  slices: Blob[]
  arrayIndex: number
}

export interface RetryData {
  fileId: string
  fileName: string
  missingChunks: number[]
}

export interface ChunkData {
  fileId: string
  chunkIndex: number
  data: ArrayBuffer
}

export interface FileMeta {
  type: string
  name: string
  size: number
  id: string
}

export interface PendingMeta {
  types: string[]
  names: string[]
  sizes: number[]
  ids: string[]
}

export interface ProtocolMessage {
  type: 'meta' | 'content' | 'retry'
  data: string | ArrayBuffer
}

export interface MessagePrefix {
  bytes: Uint8Array
  text: string
}
