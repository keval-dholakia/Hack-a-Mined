// src/lib/geminiInsights.ts
// Gemini API integration for Production Simulation AI Insights.
// Uses @google/generative-ai SDK — no raw fetch, no URL construction.
// Run: npm install @google/generative-ai

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SimResult } from '@/types/simulation';
import { fmtL, fmtN, fmtDt } from './simulationEngine';

// ── Model config ──────────────────────────────────────────────────────────────
// Change this one string to swap models. Nothing else needs to change.
// Options: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash'
const GEMINI_MODEL = 'gemini-2.5-flash';

// ── Prompt Builder ────────────────────────────────────────────────────────────
// Converts the structured SimResult into a rich plain-text context block
// that Gemini can reason over. Keeps numbers in human-readable Indian format.

export function buildSimPrompt(result: SimResult): string {
    const { mrp, crp, cost, routing, mps } = result;

    // MPS summary
    const mpsLines = Object.entries(mps)
        .map(([pid, qty]) => `  • ${pid}: ${qty} units`)
        .join('\n');

    // Material lines — flag shortages
    const matLines = mrp.lines
        .map(
            (l) =>
                `  • ${l.name} (${l.unit}): Required ${fmtN(l.req)}, Available ${fmtN(l.avail)}` +
                (l.short > 0 ? ` — SHORTAGE: ${fmtN(l.short)} ${l.unit}` : ' — OK'),
        )
        .join('\n');

    // Cost breakdown
    const costLines = [
        `  • Material Cost : ${fmtL(cost.mc)}`,
        `  • Labour Cost   : ${fmtL(cost.lc)}`,
        `  • Electricity   : ${fmtL(cost.ec)} (${fmtN(cost.kwh)} kWh)`,
        `  • TOTAL         : ${fmtL(cost.total)}`,
    ].join('\n');

    return `
You are a senior manufacturing operations analyst advising the management of an Indian automotive ancillary company. 
You have been given the output of a Production Simulation run. Analyse the data and provide structured, actionable insights.

=== MASTER PRODUCTION SCHEDULE (INPUT) ===
${mpsLines}

=== CAPACITY REQUIREMENTS (CRP) ===
  • Total Labour Hours Required : ${fmtN(crp.req)} hrs
  • Days Required               : ${crp.full} working days
  • Estimated Completion Date   : ${fmtDt(crp.comp)}
  • Monthly Capacity Available  : ${fmtN(crp.monthAvail)} hrs
  • Capacity Status             : ${crp.overload ? '⚠ OVERLOAD — target CANNOT be met this month' : '✓ Within monthly capacity'}

=== MATERIAL REQUIREMENTS (MRP) ===
  Material Readiness: ${mrp.readinessPct.toFixed(1)}% (${mrp.readyN} of ${mrp.lines.length} materials fully stocked)
${matLines}

=== COST ESTIMATION ===
${costLines}

=== YOUR TASK ===
Provide a concise management briefing structured under exactly these four headings. 
Use plain language — avoid jargon. Be specific with numbers. Highlight risks clearly.

**1. Executive Summary**
2–3 sentences. Is this production plan feasible? What is the single biggest risk?

**2. Material Procurement Actions**
List only the materials that need immediate procurement action (shortages). 
For each: what to order, estimated cost impact, and urgency. 
If all materials are available, state that clearly.

**3. Capacity & Scheduling Recommendations**
Is the timeline realistic? If overloaded, give specific options (e.g. add N workers, extend shift by X hours, split batch). 
If within capacity, confirm and note any buffer.

**4. Cost Optimisation Opportunities**
Where is the highest cost? What levers can management pull to reduce it? 
Give 2–3 specific, actionable suggestions relevant to this run.
`.trim();
}

// ── Gemini API Call ───────────────────────────────────────────────────────────
// Returns the full response text. Throws on API or empty response error.

export async function fetchGeminiInsights(result: SimResult): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local');

    // Initialise SDK with your key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Pick model by name — no URL needed
    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
            temperature: 0.4,   // factual, low creativity
            topP: 0.9,
        },
    });

    const prompt = buildSimPrompt(result);
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    if (!text) throw new Error('Gemini returned an empty response.');
    return text;
}