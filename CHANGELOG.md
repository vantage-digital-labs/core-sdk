# Changelog

## [2.3.2] - 2026-03-14
### Fixed
- Narrowed `context` field type to `ContextVars` (no nested objects)
- Added region validation in `VantageClient` constructor

## [2.3.1] - 2026-02-25
### Fixed
- Abort/timeout errors no longer trigger retry attempts
- Default retry backoff interval corrected to 1000ms per attempt

## [2.3.0] - 2026-01-28
### Added
- WebSocket streaming API for real-time dialogue
- `wsKeepAlive` configuration option
- Korean (ko) language support for voice synthesis

### Fixed
- Memory leak in long-running WebSocket connections

## [2.2.0] - 2025-11-20
### Added
- Voice synthesis module (`client.voice.synthesize`)
- Chinese (zh) language support
- Rate limit error handling with `retryAfter`

## [2.1.0] - 2025-09-12
### Added
- Context variables support in chat requests
- NPC emotion state in response
- Action trigger callbacks

## [2.0.0] - 2025-07-01
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
