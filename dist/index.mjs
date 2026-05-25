// src/index.ts
import { WebSocket } from "ws";
import { request } from "undici";
var VantageError = class extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "VantageError";
  }
};
var RateLimitError = class extends VantageError {
  constructor(retryAfter) {
    super("Rate limit exceeded", "RATE_LIMITED", 429);
    this.retryAfter = retryAfter;
    this.name = "RateLimitError";
  }
};
var REGION_ENDPOINTS = {
  "asia-northeast1": "https://api-tokyo.vantage-digital.online",
  "asia-northeast3": "https://api-seoul.vantage-digital.online",
  "cn-shanghai": "https://api-cn.vantage-digital.online",
  "us-west1": "https://api-us.vantage-digital.online"
};
var VantageClient = class {
  constructor(config) {
    this.config = {
      region: "asia-northeast1",
      timeout: 1e4,
      maxRetries: 3,
      wsKeepAlive: true,
      baseUrl: "",
      ...config
    };
    this.baseUrl = this.config.baseUrl || REGION_ENDPOINTS[this.config.region];
    this.npc = new NPCModule(this);
    this.voice = new VoiceModule(this);
  }
  async request(method, path, body) {
    let lastError = null;
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const { statusCode, headers, body: resBody } = await request(
          `${this.baseUrl}${path}`,
          {
            method,
            headers: {
              "Authorization": `Bearer ${this.config.apiKey}`,
              "Content-Type": "application/json",
              "X-SDK-Version": "2.4.1"
            },
            body: body ? JSON.stringify(body) : void 0,
            signal: AbortSignal.timeout(this.config.timeout)
          }
        );
        const data = await resBody.json();
        if (statusCode === 429) {
          const retryAfter = parseInt(headers["retry-after"]) || 60;
          throw new RateLimitError(retryAfter);
        }
        if (statusCode >= 400) {
          throw new VantageError(
            data.message || "Request failed",
            data.code || "UNKNOWN",
            statusCode
          );
        }
        return data;
      } catch (err) {
        lastError = err;
        if (err instanceof RateLimitError || err instanceof VantageError) {
          throw err;
        }
        if (attempt < this.config.maxRetries) {
          await new Promise((r) => setTimeout(r, 1e3 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }
  createWebSocket(path) {
    const wsUrl = this.baseUrl.replace("https://", "wss://");
    const ws = new WebSocket(`${wsUrl}${path}`, {
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "X-SDK-Version": "2.4.1"
      }
    });
    if (this.config.wsKeepAlive) {
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 3e4);
      ws.on("close", () => clearInterval(interval));
    }
    return ws;
  }
};
var NPCModule = class {
  constructor(client) {
    this.client = client;
  }
  async chat(req) {
    return this.client.request("POST", "/v2/npc/chat", req);
  }
  stream(opts) {
    return this.client.createWebSocket(
      `/v2/npc/stream?npcId=${opts.npcId}&playerId=${opts.playerId}`
    );
  }
};
var VoiceModule = class {
  constructor(client) {
    this.client = client;
  }
  async synthesize(req) {
    return this.client.request("POST", "/v2/voice/synthesize", req);
  }
};
var index_default = VantageClient;
export {
  RateLimitError,
  VantageClient,
  VantageError,
  index_default as default
};
