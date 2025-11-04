# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Component | Version | Supported          |
| --------- | ------- | ------------------ |
| Client    | 3.4.x   | :white_check_mark: |
| Client    | 3.3.x   | :white_check_mark: |
| Client    | < 3.3   | :x:                |
| Server    | 3.4.x   | :white_check_mark: |
| Server    | 3.3.x   | :white_check_mark: |
| Server    | < 3.3   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### How to Report

1. **Email**: Send details to [mail@ch3nyang.top](mailto:mail@ch3nyang.top)
2. **Subject**: Include "SECURITY" in the email subject
3. **Details**: Provide a detailed description of the vulnerability:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and determine severity
- **Fix**: We will work on a fix and keep you updated on progress
- **Disclosure**: We will coordinate with you on responsible disclosure timing
- **Credit**: You will be credited in the security advisory (if desired)

### Security Best Practices

Please **do not**:

- Publicly disclose the vulnerability before it has been addressed
- Test vulnerabilities on production systems
- Access or modify data belonging to other users

### Scope

Security issues we are interested in:

- Cross-site scripting (XSS)
- Authentication/authorization bypasses
- Data leakage or privacy issues
- Denial of service (DoS)
- WebRTC security vulnerabilities
- Dependency vulnerabilities

### Out of Scope

- Issues in third-party dependencies (report to the dependency maintainer)
- Social engineering attacks
- Physical attacks
- Issues requiring user interaction (e.g., phishing)

## Security Features

EasyTransfer implements several security measures:

- **End-to-End Encryption**: All file transfers use WebRTC's built-in encryption (DTLS-SRTP)
- **No Server Storage**: Files are transferred peer-to-peer and never stored on servers
- **Anonymous**: No user accounts or personal information required
- **Secure Defaults**: HTTPS and secure WebRTC protocols by default
- **Regular Updates**: Dependencies are regularly updated via Dependabot

## Security Updates

Security updates are prioritized and released as soon as possible:

- **Critical**: Released within 24-48 hours
- **High**: Released within 1 week
- **Medium**: Released in next regular update
- **Low**: Addressed in future updates

## Additional Resources

- [WebRTC Security](https://webrtc-security.github.io/)
- [OWASP WebRTC Security](https://owasp.org/www-community/vulnerabilities/WebRTC_Security)
- [Project Wiki](https://github.com/WCY-dt/EasyTransfer/wiki/Navigator)

Thank you for helping keep EasyTransfer secure!
