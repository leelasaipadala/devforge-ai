import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config/env.js';

async function main() {
  if (!config.geminiApiKey) {
    console.error('[DIAGNOSTIC ERROR] No API key');
    return;
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const modelsToTest = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-1.0-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-lite-preview-02-05'
  ];

  for (const m of modelsToTest) {
    try {
      console.log(`[DIAGNOSTIC] Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Hello');
      const response = await res.response;
      console.log(`[DIAGNOSTIC SUCCESS] Model ${m} output:`, response.text());
      return;
    } catch (err: any) {
      console.error(`[DIAGNOSTIC FAIL] Model ${m} status:`, err?.status, 'message:', err?.message?.slice(0, 150));
    }
  }
}

main();
