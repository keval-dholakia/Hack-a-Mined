import { GoogleGenerativeAI } from '@google/generative-ai';

// Polyfill for Next.js/Node environment where pdf-parse expects browser globals
if (typeof globalThis !== 'undefined') {
  if (typeof (globalThis as any).DOMMatrix === 'undefined') {
    (globalThis as any).DOMMatrix = class DOMMatrix {};
  }
  if (typeof (globalThis as any).Path2D === 'undefined') {
    (globalThis as any).Path2D = class Path2D {};
  }
}

const pdfParse = require('pdf-parse');

export async function extractTextFromBuffer(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (fileType === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Only PDF and TXT are supported.');
  }
}

// Simple sliding window chunker
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  // Using text-embedding-004 model for 768 dimensions
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
