# Changelog

## [2.4.1] - 2026-05-10
### Fixed
- WebSocket reconnection race condition on region failover
- TypeScript strict mode compatibility for ChatResponse type

## [2.4.0] - 2026-04-22
### Added
- Multi-language auto-detection for player input
- Voice emotion parameter for TTS requests
- `us-west1` region support (beta)

### Changed
- Default timeout increased to 10000ms
- Improved retry logic with exponential backoff

## [2.3.0] - 2026-03-15
### Added
- WebSocket streaming API for real-time dialogue
- `wsKeepAlive` configuration option
- Korean (ko) language support for voice synthesis

### Fixed
- Memory leak in long-running WebSocket connections

## [2.2.0] - 2026-01-28
### Added
- Voice synthesis module (`client.voice.synthesize`)
- Chinese (zh) language support
- Rate limit error handling with `retryAfter`

## [2.1.0] - 2025-11-12
### Added
- Context variables support in chat requests
- NPC emotion state in response
- Action trigger callbacks

## [2.0.0] - 2025-09-01
### Breaking Changes
- Migrated to new v2 API endpoints
- `VantageClient` constructor now requires config object (not positional args)
- Removed deprecated `client.dialogue()` method

### Added
- Region selection support (tokyo, seoul, shanghai)
- TypeScript type definitions

## [1.0.0] - 2023-06-15
### Initial Release
- Basic NPC chat API
- API key authentication
- Tokyo region only
