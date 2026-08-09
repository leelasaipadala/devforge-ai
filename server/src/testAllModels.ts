import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config/env.js';

async function testAllModels() {
  console.log('[KEY TEST] Key:', config.geminiApiKey);

  if (!config.geminiApiKey) {
    console.error('No API key in config');
    return;
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro-002',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-exp',
    'gemini-2.0-pro-exp-02-05',
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-pro'
  ];

  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Hi');
      const response = await res.response;
      console.log(`>>> SUCCESS with model: ${m} ->`, response.text());
      return;
    } catch (err: any) {
      console.error(`ERR ${m}:`, err?.status, err?.message?.slice(0, 120));
    }
  }
}

testAllModels();
