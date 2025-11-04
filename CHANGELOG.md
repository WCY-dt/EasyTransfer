# Changelog

All notable changes to this project will be documented in this file.

## [3.4.1] - 2025-11-04

### Added

- Comprehensive unit tests (170 total: 13 server, 157 client)
- Vitest testing framework for both client and server
- Test scripts in package.json (test, test:watch, test:ui)
- Automated testing in GitHub Actions CI/CD pipeline

### Changed

- GitHub Actions workflow now includes build and test steps
- Improved ID generation algorithm for better reliability
- Refactored server code to extract testable utility functions

## [3.4.0] - 2025-11-04

**New Features:** The new version introduces settings for language preference and theme preference.

### Added

- Support for language preference setting (i18n), including English, Simplified Chinese, Traditional Chinese, Japanese, Korean, Russian, French, Spanish, and German
- Support for theme preference setting (light/dark/auto)

### Changed

- Improved settings styling

## [3.3.2] - 2025-10-21

### Added

- Add GitHub Actions workflow to run pre build checks

### Changed

- Bump dependencies to fix security vulnerabilities

## [3.3.1] - 2025-08-19

### Fixed

- Fixed the issue where plain text can not be sent correctly

## [3.3.0] - 2025-08-18

**New Features:** The new version introduces huge availability improvements and performance enhancements.

### Added

- Support for retry on transfer failure
- Support for parallel transfer of multiple files

## [3.2.0] - 2025-07-09

**New Features:** The self-hosted signal server is now available.

### Changed

- Move signal server to self-hosted
- Modify TURN/STUN server IP

## [3.1.19] - 2025-03-15

### Changed

- Using `@mdi/js` instead of webfont

### Fixed

- Fix the issue where wrong target will cause server to crash
- Fix photo stream style and add layout

## [3.1.18] - 2025-03-12

### Changed

- STUN/TURN servers will reset on new version release

### Fixed

- Fix the issue where wrong target will cause server to crash

## [3.1.17] - 2025-03-11

### Fixed

- Fix the issue where auto download is disabled in certain browsers

## [3.1.16] - 2025-02-14

### Changed

- Improved webpage design
- Pinia is bumped to v3

## [3.1.15] - 2025-01-04

### Added

- Support auto download of file when file is ready
- Support setting of auto download

### Changed

- Improved webpage design

## [3.1.14] - 2025-01-03

### Fixed

- Fixed connection status tracking, now correct icon will display
- Fixed all the warnings in the code

## [3.1.13] - 2025-01-03

### Added

- Support TURN server availability check and display status

### Fixed

- Fixed bugs of webpage style

## [3.1.12] - 2025-01-02

### Changed

- Isolate default setting values to a new file

### Fixed

- Fixed the issue where the TURN server can not be accessed

## [3.1.11] - 2024-12-27

### Changed

- Deploy the TURN server on turn.ch3nyang.top instead of metered
- Use the STUN server on Google instead of metered

## [3.1.10] - 2024-12-24

### Changed

- Only reload when specific settings are changed

### Fixed

- Fixed the CI/CD pipeline to deploy the correct version

## [3.1.9] - 2024-12-23

### Added

- Support auto display of video
- Add CI/CD pipeline to automate the whole deployment process

### Changed

- Refactor the code to improve the code quality and maintainability

### Fixed

- Fixed the issue where the svg can not be displayed correctly when downloading

## [3.1.8] - 2024-12-18

### Added

- Add support for self-deploy using Docker

### Changed

- Increase max retransmits to improve connection reliability

## [3.1.7] - 2024-12-15

### Added

- Support copy and download buttons on device with no touch and hover

### Fixed

- Fixed bugs in regex
- Fixed bugs in text transmission

## [3.1.6] - 2024-12-10

### Changed

- Refactored the server code from JS to TS to improve the code quality and maintainability
- Improved webpage design

### Fixed

- Fixed the issue where filename can be parsed as a number
- Fixed style of filename where word and line break are incorrect

### Removed

- Removed photo type and now it is viewed as a normal file

## [3.1.5] - 2024-12-09

### Fixed

- Fixed the issue where version can not be displayed correctly

## [3.1.4] - 2024-12-09

## Changed

- Refactored the client code from JS to TS to improve the code quality and maintainability

## [3.1.3] - 2024-12-09

### Added

- Added version to webpage header

### Fixed

- Fixed logic of setting to avoid unnecessary reload

## [3.1.2] - 2024-12-08

### Added

- Support for settings on wether to preview the images
- Support for settings on wether to open the link directly

## [3.1.1] - 2024-12-06

### Added

- Support for auto detection of compressed file and key file

## [3.1.0] - 2024-12-06

**New Features:** The new version supports settings, parallel transfer, auto detect of message, and dev server. The new version also includes performance optimization and improved webpage design.

### Added

- Support for settings
- Support for chunked data with number of chunks
- Support for multiple channels
- Support for auto detect of file type
- Support for opening link directly
- Support for dev server

### Changed

- Performence optimization
- Improved webpage design with blur and background
- Changed webpage hover style

### Fixed

- Fixed the issue when file is empty

### Removed

- Removed extra RSA encryption

## [3.0.0] - 2024-12-03

### BREAKING CHANGES

- The Signal Server has been updated to support extra features. The new Signal Server is not compatible with the previous version.

### Changed

- Signal Server is updated to support upcomming extra features

## [2.3.1] - 2024-12-02

### Changed

- All the codes are now formatted and linted using Prettier and ESLint

## [2.3.0] - 2024-12-02

**New Features:** The new version mainly focuses on improving the developing experience. It is prepared for the upcomming future major version.

### Changed

- Vite is bumped to v6

## [2.2.1] - 2024-11-12

### Fixed

- Fixed the issue where photos can not be uploaded correctly

## [2.2.0] - 2024-11-01

**New Features:** A totally different frontend design has been implemented. The new design is more user-friendly and responsive. The new design is also more visually appealing and easier to use.

### Added

- Added page header and footer

### Changed

- Improved webpage design

### Removed

- Removed logs in client webpage

## [2.1.2] - 2024-10-22

### Changed

- Refactor by tidying up the code and folder structure

## [2.1.1] - 2024-10-22

### Changed

- Refactored using SCSS

### Fixed

- Fixed wrong documentation link

## [2.1.0] - 2024-10-22

**New Features:** The new version supports more file types, including images, snapshots, and plain text. The new version also supports extra RSA encryption.

### Added

- File will transfer metadata first before content
- Support for large file transfer
- Support for image and snapshot transfer
- Support for plain text transfer
- Support extra RSA encryption

### Changed

- Code will not include `01OIL` to avoid misunderstanding
- Improved webpage design to fit mobile devices
- Fewer messages needed to establish a connection

## [2.0.0] - 2024-10-22

### BREAKING CHANGES

- The Signal Server has been updated to support extra features. The new Signal Server is not compatible with the previous version.

### Changed

- Refactored using Vue.js
- Clients exchange more information when establishing a connection

## [1.1.0] - 2024-06-19

**New Features:** The new version supports multiple file transfers, file transfer progress, and STUN and TURN servers.

### Added

- Support for multiple file transfer
- Support for file transfer progress
- Support for STUN and TURN servers

### Changed

- Improved webpage design

## [1.0.0] - 2024-06-18

### Added

- Initial release
- Support for Signal Server
- Support for webpage to transfer files
