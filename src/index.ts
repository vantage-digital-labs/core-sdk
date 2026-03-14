import { WebSocket } from 'ws';
import { request } from 'undici';

export interface VantageConfig {
  apiKey: string;
  region?: 'asia-northeast1' | 'asia-northeast3' | 'cn-shanghai';
  timeout?: number;
  maxRetries?: number;
  wsKeepAlive?: boolean;
  baseUrl?: string;
}

export type ContextVars = Record<string, string | number | boolean>;

export interface ChatRequest {
  npcId: string;
  playerId: string;
  message: string;
  context?: ContextVars;
  language?: 'ja' | 'ko' | 'zh' | 'en';
  voiceEnabled?: boolean;
}

export interface ChatResponse {
  dialogue: string;
  emotion: string;
  sentiment: number;
  trust: number;
  audioUrl?: string;
  actionTrigger?: string;
  latencyMs: number;
}

export class VantageError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'VantageError';
  }
}

export class RateLimitError extends VantageError {
  retryAfter: number;
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMITED', 429);
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }
}

const REGION_ENDPOINTS: Record<string, string> = {
  'asia-northeast1': 'https://api-tokyo.vantage-digital.online',
  'asia-northeast3': 'https://api-seoul.vantage-digital.online',
  'cn-shanghai': 'https://api-cn.vantage-digital.online',
};

export class VantageClient {
  private config: Required<VantageConfig>;
  private baseUrl: string;

  npc: NPCModule;

  constructor(config: VantageConfig) {
    if (config.region && !REGION_ENDPOINTS[config.region]) {
      throw new Error(`Unknown region: "${config.region}". Valid regions: ${Object.keys(REGION_ENDPOINTS).join(', ')}`);
    }
    this.config = {
      region: 'asia-northeast1',
      timeout: 8000,
      maxRetries: 3,
      wsKeepAlive: true,
      baseUrl: '',
      ...config,
    };
    this.baseUrl = this.config.baseUrl || REGION_ENDPOINTS[this.config.region];
    this.npc = new NPCModule(this);
  }

  async request(method: string, path: string, body?: any): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const { statusCode, headers, body: resBody } = await request(
          `${this.baseUrl}${path}`,
          {
            method: method as any,
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
              'X-SDK-Version': '2.3.0',
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(this.config.timeout),
          }
        );

        const data = await resBody.json() as any;

        if (statusCode === 429) {
          const retryAfter = parseInt(headers['retry-after'] as string) || 60;
          throw new RateLimitError(retryAfter);
        }

        if (statusCode >= 400) {
          throw new VantageError(
            data.message || 'Request failed',
            data.code || 'UNKNOWN',
            statusCode
          );
        }

        return data;
      } catch (err) {
        lastError = err as Error;
        if (err instanceof RateLimitError || err instanceof VantageError) {
          throw err;
        }
        // Don't retry on abort/timeout — surface immediately
        if ((err as any)?.name === 'AbortError') {
          throw err;
        }
        if (attempt < this.config.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  createWebSocket(path: string): WebSocket {
    const wsUrl = this.baseUrl.replace('https://', 'wss://');
    const ws = new WebSocket(`${wsUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-SDK-Version': '2.3.0',
      },
    });

    if (this.config.wsKeepAlive) {
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);
      ws.on('close', () => clearInterval(interval));
    }

    return ws;
  }
}

class NPCModule {
  constructor(private client: VantageClient) {}

  async chat(req: ChatRequest): Promise<ChatResponse> {
    return this.client.request('POST', '/v2/npc/chat', req);
  }

  stream(opts: { npcId: string; playerId: string }) {
    return this.client.createWebSocket(
      `/v2/npc/stream?npcId=${opts.npcId}&playerId=${opts.playerId}`
    );
  }
}

export default VantageClient;
