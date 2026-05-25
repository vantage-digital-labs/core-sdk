import { VantageClient } from '@vantage-labs/core-sdk';

const client = new VantageClient({
  apiKey: process.env.VANTAGE_API_KEY!,
});

// Stream NPC dialogue for real-time display
async function streamDialogue() {
  const stream = await client.dialogue.stream({
    npcId: 'wizard-001',
    playerMessage: 'Tell me about the ancient prophecy.',
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.text);
  }
  console.log();
}

streamDialogue().catch(console.error);
