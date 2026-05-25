import { VantageClient } from '@vantage-labs/core-sdk';

const client = new VantageClient({
  apiKey: process.env.VANTAGE_API_KEY!,
});

// Batch generate dialogue for multiple NPCs
async function batchGenerate() {
  const npcs = ['merchant-001', 'guard-002', 'wizard-003'];
  const message = 'A dragon has been spotted nearby!';

  const responses = await Promise.all(
    npcs.map(npcId =>
      client.dialogue.generate({
        npcId,
        playerMessage: message,
      })
    )
  );

  responses.forEach((res, i) => {
    console.log(`${npcs[i]}: ${res.text} [${res.emotion}]`);
  });
}

batchGenerate().catch(console.error);
