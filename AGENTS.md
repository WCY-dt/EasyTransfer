# AI Agent Guide for EasyTransfer

## Introduction

This document provides guidance for AI agents (including GitHub Copilot Workspace, autonomous coding agents, and other AI-powered development tools) working with the EasyTransfer codebase.

## Quick Start for AI Agents

### Repository Overview

**EasyTransfer** is an end-to-end encrypted, anonymous file transfer application that enables peer-to-peer file sharing across any network using simple device codes.

**Core Technologies:**

- Frontend: Vue 3 + TypeScript + Vite + Pinia
- Backend: Node.js + TypeScript + Socket.io
- Communication: WebRTC (peer-to-peer) + Socket.io (signaling)

### Project Structure

```plaintext
├── client/               # Vue.js frontend application
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── stores/       # Pinia state stores
│   │   ├── utils/        # Utility functions
│   │   ├── config/       # Configuration files
│   │   └── types/        # TypeScript type definitions
│   └── package.json
├── server/               # Node.js backend server
│   ├── src/
│   │   └── server.ts     # Main server file
│   └── package.json
├── assets/               # Static assets
└── .github/              # GitHub workflows and templates
```

## Development Workflow

### 1. Setup and Installation

```bash
# Client setup
cd client
npm install

# Server setup
cd ../server
npm install
```

### 2. Running the Application

```bash
# Start client dev server (in /client)
npm run dev

# Start server in dev mode (in /server)
npm run dev
```

### 3. Build Process

```bash
# Build client (in /client)
npm run build

# Build server (in /server)
npm run build
```

### 4. Code Quality Checks

```bash
# Lint and format client (in /client)
npm run lint
npm run format

# Lint and format server (in /server)
npm run lint
npm run format

# Run tests (in /client or /server)
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
```

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for semantic commit messages:

### Format

```plaintext
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
feature(client): add dark mode theme support
fix(server): resolve connection timeout issue
docs(readme): update installation instructions
test(client): add FileChunkManager unit tests
refactor(utils): extract ID generation to utils
ci: add automated testing to GitHub Actions
chore(dependencies): update dependencies to latest versions
```

### Best Practices

- Use present tense (`add` not `added`)
- Use imperative mood (`move` not `moves`)
- Keep first line under 72 characters
- Reference issues/PRs in footer when applicable
- Break long descriptions into body paragraphs

## Key Concepts for AI Agents

### Architecture Understanding

#### 1. **WebRTC Peer-to-Peer Architecture**

- Files are transferred **directly** between peers using WebRTC data channels
- Server acts only as a **signaling server** for connection establishment
- No file data passes through the server (true peer-to-peer)

#### 2. **Connection Flow**

```plaintext
Device A                Socket.io Server              Device B
   |                            |                          |
   |---(1) Generate Code------->|                          |
   |                            |<---(2) Connect w/ Code---|
   |<---(3) Exchange Signals--->|<---(3) Exchange Signals-|
   |                            |                          |
   |------------(4) WebRTC Connection------------------->|
   |<-----------(5) Direct File Transfer----------------->|
```

#### 3. **State Management**

- Uses Pinia for Vue state management
- Stores handle connection state, peer information, transfer progress
- Reactive updates drive UI changes

### Critical Features

#### Security & Privacy

- **E2EE**: All transfers are end-to-end encrypted via WebRTC
- **Anonymous**: No user accounts or personal information
- **No Storage**: Files never stored on server
- **Configurable Servers**: Users can specify their own STUN/TURN servers

#### File Transfer

- Supports multiple file types and sizes
- Chunked transfer for large files
- Progress tracking
- Simultaneous multi-file transfers
- Support for text messages

#### Network Capabilities

- Works across LAN and WAN
- NAT traversal using STUN/TURN
- Handles various network configurations
- Fallback mechanisms for connection issues

## Guidelines for Code Changes

### Making Changes Safely

1. **Understand Before Modifying**
   - Read existing code in the area you're modifying
   - Understand the WebRTC flow if touching connection logic
   - Check related Pinia stores for state dependencies

2. **Minimal Changes Principle**
   - Make the smallest possible change to achieve the goal
   - Don't refactor unrelated code
   - Preserve existing functionality

3. **Type Safety**
   - Always use TypeScript types
   - Don't use `any` - define proper types
   - Update type definitions when changing data structures

4. **Test Your Changes**
   - Run linting: `npm run lint`
   - Run formatting: `npm run format`
   - Build the project: `npm run build`
   - Test locally with both client and server running

### Common Tasks and Patterns

#### Adding a New Vue Component

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  // Define props
}

const props = defineProps<Props>()
const emit = defineEmits<{
  eventName: [payload: string]
}>()

// Component logic here
</script>

<template>
  <!-- Template here -->
</template>

<style scoped lang="scss">
/* Styles here */
</style>
```

#### Adding Socket.io Event Handlers (Server)

```typescript
io.on('connection', (socket) => {
  socket.on('event-name', (data) => {
    // Handle event
    socket.emit('response-event', responseData)
  })
})
```

#### Adding Socket.io Event Handlers (Client)

```typescript
import { socket } from '@/config/socket'

socket.on('event-name', (data) => {
  // Handle event
})

socket.emit('event-name', payload)
```

#### Working with Pinia Stores

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  // State
  const myState = ref<Type>(initialValue)
  
  // Actions
  function myAction() {
    // Logic here
  }
  
  // Getters (computed)
  const myGetter = computed(() => {
    return /* computed value */
  })
  
  return {
    myState,
    myAction,
    myGetter
  }
})
```

### File Locations for Common Tasks

| Task | Location |
|------|----------|
| Add UI component | `/client/src/components/` |
| Modify connection logic | `/client/src/stores/` or `/client/src/utils/` |
| Add server event handler | `/server/src/server.ts` |
| Update configuration | `/client/src/config/` |
| Add type definitions | `/client/src/types/` or component file |
| Modify styles | Component `<style>` section or `/client/src/assets/` |

## Testing Strategy

### Test Infrastructure

The project uses **Vitest** for comprehensive unit testing:

- **Client Tests (157 tests)**:
  - FileChunkManager (28 tests): file slicing, chunk management, merging, validation
  - msgType utilities (33 tests): link detection, file type identification
  - FileProtocol (24 tests): message parsing, encoding/decoding, round-trip validation
  - RetryManager (28 tests): timeout handling, retry logic, state management
  - ThemeManager (17 tests): theme application, color validation, accessibility
  - WebRTC Connection Workflow (27 tests): connection lifecycle, signaling, data channels

- **Server Tests (13 tests)**: ID generation, character validation, collision prevention

### Running Tests

```bash
# In /client or /server directory
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode (auto-rerun on changes)
npm run test:ui         # Run tests with interactive UI
```

### What to Test

1. **WebRTC Connection**: Verify peers can connect through signaling
2. **File Transfer**: Test various file sizes and types
3. **Protocol Handling**: Validate message encoding/decoding
4. **Retry Logic**: Test timeout handling and retry mechanisms
5. **Error Handling**: Test disconnections and failures
6. **UI Components**: Verify theming and state management

### Testing Best Practices

- Write tests for new utilities and functions
- Mock external dependencies (WebRTC, Socket.io)
- Test edge cases and error conditions
- Keep tests focused and isolated
- Run tests before committing changes

## Common Pitfalls and How to Avoid Them

### 1. WebRTC Connection Issues

- **Problem**: Connections fail in certain network configurations
- **Solution**: Ensure STUN/TURN configuration is correct; test with different network setups

### 2. Memory Issues with Large Files

- **Problem**: Large file transfers cause memory overflow
- **Solution**: Use proper chunking; avoid loading entire files into memory

### 3. State Synchronization

- **Problem**: UI doesn't update when state changes
- **Solution**: Use Vue reactivity properly (ref, reactive); ensure Pinia stores are used correctly

### 4. Socket.io Event Naming

- **Problem**: Mismatched event names between client and server
- **Solution**: Define event names as constants; keep client and server in sync

### 5. TypeScript Type Errors

- **Problem**: Type mismatches cause build errors
- **Solution**: Define proper interfaces; avoid `any`; use type guards

## Debugging Tips

### Client Debugging

- Use Vue DevTools for component inspection
- Check browser console for WebRTC errors
- Monitor Network tab for Socket.io traffic
- Use `console.log` strategically (remove before committing)

### Server Debugging

- Use `nodemon` for auto-restart during development
- Check server logs for Socket.io connections
- Use Node.js debugger for complex issues
- Monitor connection count and cleanup

### WebRTC Debugging

- Check ICE candidate gathering
- Verify STUN/TURN server connectivity
- Monitor data channel state
- Check for firewall/NAT issues

## CI/CD Integration

### GitHub Actions Workflows

The project uses GitHub Actions for:

- **Lint and Format Check** (`check.yml`): Runs on PRs and main branch
- **Pre-build** (`pre-build.yml`): Validates builds
- **Deploy** (`deploy.yml`): Deploys to production

### Pre-commit Checklist for AI Agents

Before committing changes:

- [ ] Run `npm run lint` in both client and server
- [ ] Run `npm run format` in both client and server  
- [ ] Run `npm test` in both client and server (all tests pass)
- [ ] Build succeeds: `npm run build` in both directories
- [ ] Manual testing completed (if applicable)
- [ ] No console.log statements left in code
- [ ] TypeScript types are correct
- [ ] No new ESLint warnings
- [ ] Changes follow existing code style
- [ ] Commit message follows semantic commit format

## Dependencies Management

### Adding New Dependencies

1. **Evaluate necessity**: Is this dependency really needed?
2. **Check security**: Use `npm audit` to check for vulnerabilities
3. **Consider bundle size**: Will this bloat the client bundle?
4. **Check license**: Ensure license compatibility (project uses MIT)
5. **Install appropriately**:
   - Production: `npm install <package>`
   - Development: `npm install -D <package>`

### Updating Dependencies

- Use Dependabot for automated updates (already configured)
- Test thoroughly after updating major versions
- Check CHANGELOG of dependencies for breaking changes

## Security Considerations

### Must Follow

- ✅ Never log sensitive data (file contents, user info)
- ✅ Validate and sanitize all inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Implement rate limiting on server endpoints
- ✅ Use secure WebRTC protocols (DTLS-SRTP)

### Must Avoid

- ❌ Storing files on server
- ❌ Logging connection details or file metadata
- ❌ Using `any` type in security-critical code
- ❌ Exposing internal server details in errors
- ❌ Committing secrets or API keys

## Documentation Updates

When making changes, update:

- **README.md**: For user-facing features
- **CONTRIBUTING.md**: For development process changes
- **CHANGELOG.md**: For notable changes
- **This file (AGENTS.md)**: For new patterns or guidelines
- **Code comments**: For complex logic only

## Useful Resources

### External Documentation

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vite.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Project Documentation

- [EasyTransfer Wiki](https://github.com/WCY-dt/EasyTransfer/wiki/Navigator)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## Questions and Support

If you're an AI agent and encounter:

- **Unclear code**: Check related files and commit history
- **Missing context**: Review README.md and related documentation
- **Uncertain about approach**: Follow existing patterns in the codebase
- **Breaking changes**: Preserve backward compatibility; document changes

## Final Notes for AI Agents

- **Prioritize user privacy and security** in all changes
- **Keep the application simple and easy to use** - complexity should be hidden
- **Test WebRTC functionality** thoroughly - it's the core feature
- **Follow TypeScript best practices** - type safety is important
- **Maintain code quality** - run linters and formatters
- **Think about edge cases** - network issues, large files, multiple connections
- **Document complex changes** - help future developers (human or AI)

Good luck, and happy coding! 🚀
