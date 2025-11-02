# GitHub Copilot Instructions for EasyTransfer

## Project Overview

EasyTransfer is a free, anonymous, encrypted, and easy-to-use E2EE file transfer tool built with WebRTC and Vue.js. The project enables peer-to-peer file transfers between devices across any network using simple device codes.

## Project Structure

```
/client       - Vue 3 + TypeScript frontend application
/server       - Node.js + TypeScript backend server (Socket.io)
/assets       - Static assets (images, icons)
/.github      - GitHub workflows and templates
```

## Technology Stack

### Client
- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Real-time Communication**: Socket.io-client, WebRTC
- **Styling**: Sass/SCSS
- **Code Quality**: ESLint, Prettier

### Server
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Socket.io
- **Build**: TypeScript Compiler (tsc)
- **Code Quality**: ESLint, Prettier

## Development Commands

### Client (in `/client` directory)
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint with auto-fix
npm run format    # Format code with Prettier
```

### Server (in `/server` directory)
```bash
npm run dev       # Build and start with nodemon
npm run build     # Compile TypeScript
npm run start     # Start production server
npm run lint      # Run ESLint with auto-fix
npm run format    # Format code with Prettier
```

## Code Style Guidelines

### General
- Use TypeScript for type safety
- Follow existing code patterns and conventions
- Write clear, self-documenting code
- Keep functions small and focused
- Use meaningful variable and function names

### Vue Components
- Use Composition API with `<script setup>` syntax
- Define props with TypeScript interfaces
- Use reactive state management with Pinia stores
- Keep components focused on single responsibilities
- Use Vue 3 best practices (ref, reactive, computed, watch)

### TypeScript
- Enable strict type checking
- Avoid `any` type - use proper types or `unknown`
- Define interfaces for complex data structures
- Use type guards for runtime type checking
- Export types that are used across files

### File Naming
- Vue components: PascalCase (e.g., `FileTransfer.vue`)
- TypeScript files: camelCase (e.g., `socketManager.ts`)
- Utilities: camelCase with descriptive names
- Constants: UPPER_SNAKE_CASE or camelCase based on context

### Code Organization
- Keep related functionality together
- Separate business logic from UI components
- Use utility functions for shared logic
- Store configuration in dedicated files
- Define types in separate type files when shared

## Key Features to Understand

### WebRTC Implementation
- Peer-to-peer connection establishment
- STUN/TURN server configuration
- Data channel management
- ICE candidate handling

### Socket.io Integration
- Device code generation and management
- Signaling server for WebRTC
- Connection state management
- Error handling and reconnection logic

### File Transfer Flow
1. Device code generation
2. Peer connection via code
3. WebRTC connection establishment
4. File chunking and transfer
5. Progress tracking
6. Transfer completion/error handling

## Testing Considerations

- Test WebRTC connection establishment
- Verify file transfer integrity
- Test connection across different networks
- Validate encryption implementation
- Test edge cases (large files, network interruptions)

## Security Considerations

- **End-to-End Encryption**: All file transfers are encrypted
- **No Server Storage**: Files never stored on server
- **Anonymous**: No user registration or tracking
- **Secure WebRTC**: Use secure protocols (DTLS-SRTP)
- Never log sensitive information
- Validate and sanitize all inputs
- Implement rate limiting for connections

## Performance Guidelines

- Optimize file chunking for transfer efficiency
- Implement progress tracking without blocking
- Handle large files without memory overflow
- Minimize bundle size for client application
- Use lazy loading for Vue components where appropriate
- Optimize WebRTC configurations for different networks

## Common Patterns

### Pinia Store Usage
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  const state = ref(initialValue)
  
  const action = () => {
    // Action logic
  }
  
  return { state, action }
})
```

### Socket.io Event Handling
```typescript
socket.on('event-name', (data) => {
  // Handle event
})

socket.emit('event-name', data)
```

### WebRTC Connection Setup
```typescript
const peerConnection = new RTCPeerConnection(config)

peerConnection.ondatachannel = (event) => {
  // Handle data channel
}
```

## Important Files

- `/client/src/main.ts` - Client application entry point
- `/client/src/App.vue` - Root Vue component
- `/client/src/stores/` - Pinia state management stores
- `/server/src/server.ts` - Server entry point and Socket.io setup
- `/client/src/config/` - Configuration files
- `/client/src/utils/` - Utility functions

## Documentation

When making changes:
- Update README.md if adding user-facing features
- Update CONTRIBUTING.md if changing development process
- Add comments for complex algorithms or non-obvious logic
- Document WebRTC-specific configurations
- Keep CHANGELOG.md updated with notable changes

## Dependencies

- Review existing dependencies before adding new ones
- Keep dependencies up to date for security
- Avoid unnecessary dependencies
- Consider bundle size impact for client dependencies
- Use peer dependencies appropriately

## Accessibility

- Ensure UI is keyboard navigable
- Provide appropriate ARIA labels
- Support screen readers
- Maintain sufficient color contrast
- Test with accessibility tools

## Browser Compatibility

- Support modern browsers with WebRTC capability
- Chrome, Firefox, Safari, Edge latest versions
- Test WebRTC feature availability
- Provide fallback messages for unsupported browsers

## Helpful Context for AI Tools

- The project emphasizes privacy, security, and ease of use
- WebRTC is core to the architecture - understand it well
- Socket.io is used only for signaling, not file transfer
- Files go directly peer-to-peer, never through server
- Device codes are simple 4-digit identifiers
- Project supports both LAN and WAN transfers
- STUN/TURN servers are configurable by users
