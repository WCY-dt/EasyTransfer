# Contributing to EasyTransfer

Thank you for considering contributing to EasyTransfer! We welcome contributions from the community. Please follow these guidelines to ensure a smooth contribution process.

## Getting Started

1. **Fork the repository** on GitHub.

2. **Clone your forked repository** to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/EasyTransfer.git
   cd EasyTransfer
   ```

3. **Install dependencies** for both client and server:

   ```bash
   # Client
   cd client
   npm install

   # Server
   cd ../server
   npm install
   ```

4. **Create a new branch** for your feature or bugfix:

   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

### Running the Application

```bash
# Start the client (in /client directory)
npm run dev

# Start the server (in /server directory)
npm run dev
```

### Code Quality

Before submitting changes, ensure your code meets quality standards:

```bash
# Lint your code
npm run lint

# Format your code
npm run format

# Run tests
npm test

# Build the project
npm run build
```

## Making Changes

1. **Follow the project's coding standards**:
   - Use TypeScript for type safety
   - Follow existing code patterns and conventions
   - Keep functions small and focused
   - Write clear, self-documenting code

2. **Write semantic commit messages** following [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   <type>(<scope>): <description>
   
   [optional body]
   
   [optional footer]
   ```

   **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

   **Examples**:
   ```bash
   feat(client): add support for drag-and-drop file upload
   fix(server): resolve WebRTC connection timeout
   docs(readme): update installation instructions
   test(client): add unit tests for FileChunkManager
   ```

3. **Write tests** for new features or bug fixes:
   - Add unit tests in the appropriate test file
   - Ensure all tests pass before submitting
   - Aim for comprehensive test coverage

4. **Test your changes thoroughly**:
   - Test WebRTC connections on different networks
   - Verify file transfers work correctly
   - Check UI responsiveness
   - Test edge cases and error conditions

## Submitting a Pull Request

1. **Push your changes** to your forked repository:

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a pull request** on the original repository.

3. **Provide a clear description**:
   - Explain what changes you made and why
   - Reference any related issues (e.g., "Fixes #123")
   - Include screenshots for UI changes
   - List any breaking changes

4. **Ensure CI checks pass**:
   - All tests must pass
   - Code must be properly linted and formatted
   - Build must succeed

5. **Respond to review feedback**:
   - Address reviewer comments promptly
   - Make requested changes
   - Re-request review after updates

## Code Review Process

- Maintainers will review your PR as soon as possible
- Reviews may request changes to improve code quality
- Once approved, a maintainer will merge your PR
- Your contribution will be acknowledged in the release notes

## Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes**: Fix issues reported in GitHub Issues
- ✨ **New features**: Add new functionality (discuss in an issue first)
- 📝 **Documentation**: Improve README, guides, or code comments
- 🧪 **Tests**: Add or improve test coverage
- 🎨 **UI/UX improvements**: Enhance user interface or experience
- ⚡ **Performance**: Optimize code for better performance
- 🔒 **Security**: Fix security vulnerabilities

## Getting Help

- Check the [Project Wiki](https://github.com/WCY-dt/EasyTransfer/wiki/Navigator) for documentation
- Review [AGENTS.md](AGENTS.md) for development guidelines
- Ask questions in GitHub Issues
- Read existing code to understand patterns

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the project
- Show empathy towards other contributors

Thank you for contributing to EasyTransfer! 🚀
