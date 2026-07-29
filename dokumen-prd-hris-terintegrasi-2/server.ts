import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Assistant for PRD Customization & Labor Compliance Advice
app.post('/api/ai/generate-prd-section', async (req, res) => {
  try {
    const { prompt, currentModule, context } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'API key Gemini tidak dikonfigurasi. Mohon atur GEMINI_API_KEY pada file .env',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Anda adalah Lead Product Manager & Enterprise HRIS System Architect senior yang berpengalaman membangun produk HRIS sekelas Mekari Talenta.
Tugas Anda adalah membantu pengguna menambah, menyesuaikan, atau memperdalam dokumen Product Requirement Document (PRD) HRIS terintegrasi dalam bahasa Indonesia.
Gunakan format Markdown yang rapi, terstruktur (memiliki judul, sub-judul, bullet points, kriteria penerimaan, serta acuan regulasi Indonesia seperti UU Cipta Kerja, PPh 21 TER PMK 168/2023, BPJS Kesehatan & Ketenagakerjaan jika relevan).`;

    const userPrompt = `Modul Terkait: ${currentModule || 'Umum'}
Konteks Tambahan: ${context || 'Aplikasi HRIS Terintegrasi (Absensi, Payroll, Cuti, Performance)'}

Instruksi Pengguna:
${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
      ],
      config: {
        temperature: 0.4,
        maxOutputTokens: 2500,
      }
    });

    const outputText = response.text || 'Gagal menghasilkan teks PRD. Silakan coba lagi.';
    return res.json({ result: outputText });
  } catch (error: any) {
    console.error('Error generating PRD section:', error);
    return res.status(500).json({
      error: error?.message || 'Terjadi kesalahan saat memproses permintaan AI.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HRIS PRD Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
