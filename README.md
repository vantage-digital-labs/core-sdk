# @vantage-labs/core-sdk

Official Node.js / Browser SDK for the Vantage Digital Labs AI platform.

[![npm version](https://img.shields.io/npm/v/@vantage-labs/core-sdk.svg)](https://www.npmjs.com/package/@vantage-labs/core-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

This SDK provides a lightweight client for interacting with the Vantage NPC inference API, voice synthesis pipeline, and analytics endpoints. Designed for both server-side (Node.js) and browser environments.

## Installation

```bash
npm install @vantage-labs/core-sdk
```

## Quick Start

```javascript
const { VantageClient } = require('@vantage-labs/core-sdk');

const client = new VantageClient({
  apiKey: 'vk_live_your_key_here',
  region: 'asia-northeast1' // tokyo | shanghai | seoul
});

// Send a message to an NPC
const response = await client.npc.chat({
  npcId: 'npc_blacksmith_01',
  playerId: 'player_abc',
  message: 'Can you repair my sword?',
  context: {
    playerGold: 150,
    reputation: 'friendly',
    timeOfDay: 'evening'
  }
});

console.log(response.dialogue);    // "Aye, I can fix that. 50 gold."
console.log(response.emotion);     // "helpful"
console.log(response.audioUrl);    // streaming TTS URL
```

## WebSocket Streaming

For real-time dialogue with minimal latency:

```javascript
const ws = client.npc.stream({
  npcId: 'npc_guard_01',
  playerId: 'player_abc'
});

ws.on('dialogue_chunk', (chunk) => {
  process.stdout.write(chunk.text);
});

ws.on('audio_ready', (audio) => {
  // audio.streamUrl - WebSocket audio stream
  // audio.language - 'ja' | 'ko' | 'zh' | 'en'
});

ws.on('emotion_shift', (state) => {
  // state.sentiment, state.trust, state.alertLevel
});

ws.send({ message: 'I need to pass through here.' });
```

## Voice Synthesis

```javascript
const audio = await client.voice.synthesize({
  text: 'Welcome back, adventurer.',
  voiceId: 'voice_gruff_male_01',
  language: 'en',
  emotion: 'warm'
});

// audio.url - direct audio file URL
// audio.duration - length in seconds
// audio.format - 'opus' | 'mp3'
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | required | Your studio API key |
| `region` | string | `'asia-northeast1'` | Deployment region |
| `timeout` | number | `10000` | Request timeout (ms) |
| `maxRetries` | number | `3` | Auto-retry on failure |
| `wsKeepAlive` | boolean | `true` | WebSocket ping interval |

## Supported Regions

| Region | Location | Status |
|--------|----------|--------|
| `asia-northeast1` | Tokyo, Japan | Production |
| `asia-northeast3` | Seoul, Korea | Production |
| `cn-shanghai` | Shanghai, China | Production |
| `us-west1` | Oregon, US | Beta |

## Rate Limits

| Plan | Requests/min | Concurrent WS |
|------|-------------|----------------|
| Sandbox | 60 | 2 |
| Pro | 600 | 20 |
| Enterprise | Custom | Custom |

## Error Handling

```javascript
const { VantageError, RateLimitError } = require('@vantage-labs/core-sdk');

try {
  const res = await client.npc.chat({ ... });
} catch (err) {
  if (err instanceof RateLimitError) {
    // err.retryAfter - seconds until next request allowed
  }
}
```

## Multi-Language Support

The SDK supports NPC dialogue and voice in:
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh)
- English (en)

Language is auto-detected from player input or can be explicitly set per request.

## Documentation

Full API documentation: [https://vantage-digital.online/resources/api-reference](https://vantage-digital.online/resources/api-reference)

## License

MIT - see [LICENSE](LICENSE) for details.

## Support

- Email: store@vantage-digital.online
- Documentation: https://vantage-digital.online/resources/documentation
