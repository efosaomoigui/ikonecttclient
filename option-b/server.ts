import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(express.json());

const SYSTEM_INSTRUCTION = `You are the Ikonectt AI Concierge, a knowledgeable, polite, contemporary digital telecom assistant for Ikonectt — Nigeria's premier pure optical fibre broadband provider.
Brand Name: Ikonectt (always spelt with double-t: Ikonectt).
Customer Portal: My Ikonectt.
Key Facts:
- Truly 100% uncapped, unthrottled fibre broadband. No fair-usage throttling.
- Symmetrical speeds: upload speed equals download speed.
- Low latency: sub-15ms local ping, ideal for gaming and multi-device 4K streaming.
- Coverage: Live in Lagos (Victoria Island, Ikoyi, Banana Island, Lekki Phases 1 & 2, Ikeja GRA, Maryland, Surulere, Yaba), Abuja (Maitama, Wuse II, Asokoro, Guzape), and Port Harcourt (Old & New GRA).
- Residential Plans:
  1. Connect Start (50 Mbps) - ₦21,500/month: Everyday streaming, home studies, 1-4 devices.
  2. Connect Home (100 Mbps) - ₦32,500/month: Most popular, 4K HDR entertainment, low-latency gaming, Wi-Fi 6 mesh-ready.
  3. Connect Plus (200 Mbps) - ₦54,000/month: Heavy downloaders, creators, smart homes with 15+ devices.
  4. Connect Gigabit (500 Mbps) - ₦98,000/month: Ultimate bandwidth, 8K, uncompressed files.
- Business Plans:
  1. Business Essential (100 Mbps) - ₦58,000/month: Symmetrical pipe, 1 static IPv4, 99.5% SLA.
  2. Business Pro (250 Mbps) - ₦125,000/month: 99.9% uptime SLA, 2 static IPv4s, 4-hour MTTR emergency engineer dispatch.
  3. Enterprise Dedicated (up to 1 Gbps): Custom quote, dark fiber, multi-branch point-to-point SD-WAN.
- Installation: Free standard optical terminal drop cable with fast 24-48h scheduling.
- Tone: Contemporary, concise, warm, professional, authentic to Nigeria. Keep answers short (under 3-4 sentences when possible). Recommend the best plan and mention checking street coverage.`;

// Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'API key not configured on server',
        fallbackNeeded: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format chat contents if history is provided
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I am ready to help you explore Ikonectt fibre plans and verify your street coverage.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error generating assistant response:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response',
      fallbackNeeded: true,
    });
  }
});

// Mount Vite or static build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ikonectt server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
