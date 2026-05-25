import { VantageClient } from '@vantage-labs/core-sdk';

const client = new VantageClient({
  apiKey: process.env.VANTAGE_API_KEY!,
});

// Generate NPC dialogue
async function talkToNPC() {
  const response = await client.dialogue.generate({
    npcId: 'merchant-001',
    playerMessage: 'What do you have for sale?',
    context: {
      location: 'marketplace',
      timeOfDay: 'afternoon',
    },
  });

  console.log(`NPC: ${response.text}`);
  console.log(`Emotion: ${response.emotion}`);
  console.log(`Tokens used: ${response.usage.totalTokens}`);
}

talkToNPC().catch(console.error);
