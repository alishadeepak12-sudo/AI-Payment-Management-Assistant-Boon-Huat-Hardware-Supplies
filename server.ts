import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { sampleInvoicesPreset1 } from './src/data/initialInvoices.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// In-memory data store for current application state
let currentInvoices = [...sampleInvoicesPreset1];

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/invoices', (req, res) => {
  res.json({ invoices: currentInvoices });
});

app.post('/api/invoices/reset', (req, res) => {
  const { preset } = req.body;
  if (preset === 'preset2') {
    currentInvoices = [...sampleInvoicesPreset1.map(i => i.id === 'inv-101' ? { ...i, dueDate: '2026-07-28', creditRiskStatus: 'Credit Suspension Risk' as const, priority: 'High' as const } : i)];
  } else {
    currentInvoices = [...sampleInvoicesPreset1];
  }
  res.json({ success: true, invoices: currentInvoices });
});

app.post('/api/invoices', (req, res) => {
  const { invoices } = req.body;
  if (Array.isArray(invoices)) {
    currentInvoices = invoices;
    res.json({ success: true, count: currentInvoices.length, invoices: currentInvoices });
  } else {
    res.status(400).json({ error: 'Invalid invoice array payload' });
  }
});

app.post('/api/analyze-ai', async (req, res) => {
  try {
    const { invoices, customContext } = req.body;
    const targetInvoices = Array.isArray(invoices) ? invoices : currentInvoices;

    if (!aiClient) {
      // Fallback response if GEMINI_API_KEY is not configured yet
      return res.json({
        aiInsights: "AI Analysis loaded from payment rule engine. High priority items flagged for Tan Brothers Metal Works due to credit hold risk, and Continental Hardware Hub to capture $170 early payment discount.",
        suggestedFocus: ["Approve Batch 1 today ($23,350.00)", "Contact Eng Lee Fasteners regarding $200 price discrepancy on INV-ELF-9941"]
      });
    }

    const prompt = `You are the "AI Payment Management Assistant" for Boon Huat Hardware & Supplies Pte Ltd.
Analyze the following payment batch and 3-way match data for Madam Lim (Finance) and Mr. Boon (Management).

Current Date: 2026-07-31
Invoice Data: ${JSON.stringify(targetInvoices, null, 2)}
Custom Context / Instruction: ${customContext || 'Provide payment schedule analysis, risk mitigation advice, and priority breakdown.'}

Respond in JSON format with:
1. "aiSummary": A concise 2-3 sentence overview for Madam Lim explaining cashflow recommendation and urgent items.
2. "riskExplanations": An array of objects with { "invoiceNumber": string, "supplierName": string, "riskNote": string, "recommendedAction": string } explaining why an item is urgent or held in simple language for Mr. Boon.
3. "suggestedActionSteps": An array of strings representing checklist items for Madam Lim.
4. "cashflowAdvice": A short note regarding liquidity and credit terms protection.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to run AI analysis', details: error.message });
  }
});

app.post('/api/generate-draft', async (req, res) => {
  try {
    const { invoice, purpose, channel, customInstructions } = req.body;

    if (!aiClient) {
      return res.json({
        draft: `Dear ${invoice?.supplierContact?.contactPerson || 'Accounts'},\n\n` +
          `Regarding Invoice ${invoice?.invoiceNumber} (${invoice?.amount}), please note our system detected a discrepancy (${invoice?.matchNotes}).\n` +
          `Kindly issue a credit note so we can release payment.\n\n` +
          `Best regards,\nMadam Lim\nBoon Huat Hardware & Supplies Pte Ltd`
      });
    }

    const prompt = `You are drafting a professional supplier communication for Madam Lim at Boon Huat Hardware & Supplies Pte Ltd.
Invoice #: ${invoice?.invoiceNumber}
Supplier: ${invoice?.supplierName}
Contact Person: ${invoice?.supplierContact?.contactPerson || 'Accounts Team'}
Amount: $${invoice?.amount}
3-Way Match Status: ${invoice?.matchStatus}
Match Details: ${invoice?.matchNotes}
Channel: ${channel || 'email'} (Email or WhatsApp)
Purpose: ${purpose} (discrepancy_hold_notice, payment_extension_request, payment_remittance_advice, or discount_clarification)
Custom Instructions: ${customInstructions || 'Make it polite, clear, fair, and professional.'}

Write the draft message. If channel is email, include Subject and Body. If WhatsApp, write a friendly direct text message. Ensure Madam Lim's signature is included.
Return JSON with { "subject": string, "body": string }.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, draft: parsed });
  } catch (error: any) {
    console.error('Draft Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate draft', details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
