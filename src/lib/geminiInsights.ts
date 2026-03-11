// src/lib/geminiInsights.ts
// Gemini API integration for Production Simulation AI Insights.
// Flow: build full production context -> embed prompt + context chunks ->
// rank semantic relevance -> generate feasibility-focused production plan.

import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import type { SimResult } from '@/types/simulation';
import { fmtDt, fmtN } from './simulationEngine';
import { BOM, MACHINES, MATERIALS, PRODUCTS, ROUTING } from './simulationData';
import {
    fetchGST2AReconciliations,
    fetchGSTDepositChallans,
    fetchGSTR1Uploads,
    fetchGSTRRegisters,
    fetchGSTTaxRules,
} from '@/data/statutoryMock';
import { fetchAccounts, fetchVouchers } from '@/data/financeMock';
import { fetchFreightBills } from '@/data/logisticsMock';

const GENERATION_MODEL = 'gemini-2.5-flash';
const EMBEDDING_MODEL_CANDIDATES = ['gemini-embedding-001'] as const;
const TOP_CONTEXT_CHUNKS = 5;
const EMBEDDING_TIMEOUT_MS = 35000;
const GENERATION_TIMEOUT_MS = 45000;

type ERPContext = {
    gstTaxRules: Awaited<ReturnType<typeof fetchGSTTaxRules>>;
    gstr1Uploads: Awaited<ReturnType<typeof fetchGSTR1Uploads>>;
    gst2aReconciliations: Awaited<ReturnType<typeof fetchGST2AReconciliations>>;
    gstDepositChallans: Awaited<ReturnType<typeof fetchGSTDepositChallans>>;
    gstrRegisters: Awaited<ReturnType<typeof fetchGSTRRegisters>>;
    accounts: Awaited<ReturnType<typeof fetchAccounts>>;
    vouchers: Awaited<ReturnType<typeof fetchVouchers>>;
    freightBills: Awaited<ReturnType<typeof fetchFreightBills>>;
};

interface EmbeddingChunk {
    id: string;
    title: string;
    text: string;
}

interface RankedChunk extends EmbeddingChunk {
    similarity: number;
}

interface SalesScenario {
    name: 'Conservative' | 'Base' | 'Aggressive';
    units: number;
    unitSalePriceExGst: number;
    taxableSales: number;
    outputGst: number;
    grossSalesIncGst: number;
    productionCost: number;
    projectedProfit: number;
    profitMarginPct: number;
    breakEvenUnits: number;
    netGstOutflowAfterItc: number;
}

interface SalesProjectionContext {
    plannedUnits: number;
    blendedCostPerUnit: number;
    effectiveGstRatePct: number;
    historicalTaxableTurnover: number;
    availableMatchedItc: number;
    baseUnitSalePrice: number;
    scenarios: SalesScenario[];
}

const inr = (value: number): string =>
    `INR ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const pct = (value: number): string => `${value.toFixed(2)}%`;

const num2 = (value: number): number => Number(value.toFixed(2));

function cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
}

async function loadERPContext(): Promise<ERPContext> {
    const [
        gstTaxRules,
        gstr1Uploads,
        gst2aReconciliations,
        gstDepositChallans,
        gstrRegisters,
        accounts,
        vouchers,
        freightBills,
    ] = await Promise.all([
        fetchGSTTaxRules(),
        fetchGSTR1Uploads(),
        fetchGST2AReconciliations(),
        fetchGSTDepositChallans(),
        fetchGSTRRegisters(),
        fetchAccounts(),
        fetchVouchers(),
        fetchFreightBills(),
    ]);

    return {
        gstTaxRules,
        gstr1Uploads,
        gst2aReconciliations,
        gstDepositChallans,
        gstrRegisters,
        accounts,
        vouchers,
        freightBills,
    };
}

function buildSalesProjectionContext(result: SimResult, erp: ERPContext): SalesProjectionContext {
    const plannedUnits = Object.values(result.mps).reduce((sum, qty) => sum + qty, 0);
    const productionCost = result.cost.total;
    const blendedCostPerUnit = plannedUnits > 0 ? productionCost / plannedUnits : 0;

    const totalTaxableSales = erp.gstr1Uploads.reduce((sum, row) => sum + row.taxableValue, 0);
    const totalOutputTax = erp.gstr1Uploads.reduce((sum, row) => sum + row.taxAmount, 0);
    const avgGstRulePct = erp.gstTaxRules.length
        ? erp.gstTaxRules.reduce((sum, row) => sum + row.igstPercent, 0) / erp.gstTaxRules.length
        : 18;
    const derivedGstRate = totalTaxableSales > 0 ? totalOutputTax / totalTaxableSales : avgGstRulePct / 100;
    const effectiveGstRate = derivedGstRate > 0 ? derivedGstRate : 0.18;

    const totalTaxLiability = erp.gstrRegisters.reduce((sum, row) => sum + row.totalTaxLiability, 0);
    const historicalTaxableTurnover = totalTaxLiability > 0 ? totalTaxLiability / effectiveGstRate : 0;
    const matchedItc = erp.gst2aReconciliations.reduce((sum, row) => sum + row.matchedAmount, 0);

    const fallbackUnitSalePrice = blendedCostPerUnit > 0 ? blendedCostPerUnit * 1.22 : 0;
    const baseUnitSalePrice = plannedUnits > 0 && historicalTaxableTurnover > 0
        ? historicalTaxableTurnover / plannedUnits
        : fallbackUnitSalePrice;

    const scenarioDefs = [
        { name: 'Conservative' as const, multiplier: 0.9 },
        { name: 'Base' as const, multiplier: 1.0 },
        { name: 'Aggressive' as const, multiplier: 1.1 },
    ];

    const scenarios: SalesScenario[] = scenarioDefs.map(({ name, multiplier }) => {
        const unitSalePriceExGst = num2(baseUnitSalePrice * multiplier);
        const taxableSales = num2(unitSalePriceExGst * plannedUnits);
        const outputGst = num2(taxableSales * effectiveGstRate);
        const grossSalesIncGst = num2(taxableSales + outputGst);
        const projectedProfit = num2(taxableSales - productionCost);
        const profitMarginPct = taxableSales > 0 ? num2((projectedProfit / taxableSales) * 100) : 0;
        const breakEvenUnits = unitSalePriceExGst > 0 ? num2(productionCost / unitSalePriceExGst) : 0;
        const netGstOutflowAfterItc = num2(Math.max(0, outputGst - matchedItc));

        return {
            name,
            units: plannedUnits,
            unitSalePriceExGst,
            taxableSales,
            outputGst,
            grossSalesIncGst,
            productionCost: num2(productionCost),
            projectedProfit,
            profitMarginPct,
            breakEvenUnits,
            netGstOutflowAfterItc,
        };
    });

    return {
        plannedUnits,
        blendedCostPerUnit: num2(blendedCostPerUnit),
        effectiveGstRatePct: num2(effectiveGstRate * 100),
        historicalTaxableTurnover: num2(historicalTaxableTurnover),
        availableMatchedItc: num2(matchedItc),
        baseUnitSalePrice: num2(baseUnitSalePrice),
        scenarios,
    };
}

export function buildSimPrompt(result: SimResult): string {
    const totalUnits = Object.values(result.mps).reduce((sum, qty) => sum + qty, 0);
    const shortageCount = result.mrp.lines.filter((line) => line.short > 0).length;

    return [
        'Objective: Determine production feasibility for this simulation run.',
        'Must create an end-to-end production plan and sales-linked profit projection.',
        `Planned units: ${fmtN(totalUnits)}`,
        `Material readiness: ${result.mrp.readinessPct.toFixed(1)}%`,
        `Shortage materials: ${shortageCount}`,
        `Capacity overload: ${result.crp.overload ? 'Yes' : 'No'}`,
        `Estimated completion date: ${fmtDt(result.crp.comp)}`,
    ].join('\n');
}

function buildEmbeddingChunks(
    result: SimResult,
    erp: ERPContext,
    salesProjection: SalesProjectionContext,
): EmbeddingChunk[] {
    const mpsLines = Object.entries(result.mps)
        .map(([pid, qty]) => `${pid}: ${qty} units`)
        .join('\n');

    const mrpLines = result.mrp.lines
        .map((line) => {
            const status = line.short > 0 ? `SHORT ${fmtN(line.short)} ${line.unit}` : 'OK';
            return `${line.name}: req=${fmtN(line.req)} ${line.unit}, stock=${fmtN(line.avail)} ${line.unit}, ${status}, latestPrice=${inr(line.price)}`;
        })
        .join('\n');

    const routingLines = Object.entries(result.routing.mhm)
        .map(([machine, hours]) => `${machine}: ${fmtN(hours)} machine-hours`)
        .join('\n');

    const shortageSnapshot = result.mrp.lines
        .filter((line) => line.short > 0)
        .map((line) => ({
            material: line.name,
            unit: line.unit,
            required: line.req,
            available: line.avail,
            shortage: line.short,
            purchaseRate: line.price,
            shortageValue: num2(line.short * line.price),
        }));

    return [
        {
            id: 'simulation_result_full',
            title: 'Simulation run full output (immutable)',
            text: JSON.stringify(
                {
                    mps: result.mps,
                    mrp: result.mrp,
                    crp: result.crp,
                    routing: result.routing,
                    cost: result.cost,
                },
                null,
                2,
            ),
        },
        {
            id: 'simulation_masters_full',
            title: 'Simulation masters full dataset (immutable)',
            text: JSON.stringify(
                {
                    products: PRODUCTS,
                    materials: MATERIALS,
                    bom: BOM,
                    routing: ROUTING,
                    machines: MACHINES,
                },
                null,
                2,
            ),
        },
        {
            id: 'simulation_run',
            title: 'Current simulation run summary',
            text: [
                'MPS',
                mpsLines,
                '',
                'CRP',
                `Required labor hours: ${fmtN(result.crp.req)}`,
                `Days required: ${result.crp.full}`,
                `Completion date: ${fmtDt(result.crp.comp)}`,
                `Monthly available labor hours: ${fmtN(result.crp.monthAvail)}`,
                `Overload: ${result.crp.overload ? 'Yes' : 'No'}`,
                '',
                'Cost',
                `Material: ${inr(result.cost.mc)}`,
                `Labor: ${inr(result.cost.lc)}`,
                `Electricity: ${inr(result.cost.ec)}`,
                `Total production cost (ex-GST): ${inr(result.cost.total)}`,
                '',
                'Routing machine load',
                routingLines,
            ].join('\n'),
        },
        {
            id: 'stock_and_mrp',
            title: 'Stock, shortages and procurement context',
            text: [
                `Material readiness: ${result.mrp.readinessPct.toFixed(1)}%`,
                'MRP line details:',
                mrpLines,
                '',
                'Shortage action snapshot:',
                JSON.stringify(shortageSnapshot, null, 2),
                '',
                'Current simulated stock master:',
                JSON.stringify(MATERIALS, null, 2),
            ].join('\n'),
        },
        {
            id: 'gst_context',
            title: 'GST operational context for production and sales',
            text: JSON.stringify(
                {
                    gstTaxRules: erp.gstTaxRules,
                    gstr1Uploads: erp.gstr1Uploads,
                    gstrRegisters: erp.gstrRegisters,
                    gst2aReconciliations: erp.gst2aReconciliations,
                    gstDepositChallans: erp.gstDepositChallans,
                },
                null,
                2,
            ),
        },
        {
            id: 'finance_context',
            title: 'Finance and ledger context',
            text: JSON.stringify(
                {
                    accounts: erp.accounts,
                    vouchers: erp.vouchers,
                },
                null,
                2,
            ),
        },
        {
            id: 'logistics_context',
            title: 'Logistics and freight context',
            text: JSON.stringify(erp.freightBills, null, 2),
        },
        {
            id: 'sales_projection',
            title: 'Sales assumptions and projected profit scenarios',
            text: JSON.stringify(salesProjection, null, 2),
        },
    ];
}

async function rankBySemanticRelevance(
    genAI: GoogleGenerativeAI,
    queryPrompt: string,
    chunks: EmbeddingChunk[],
): Promise<RankedChunk[]> {
    const errors: string[] = [];

    for (const modelName of EMBEDDING_MODEL_CANDIDATES) {
        const embeddingModel = genAI.getGenerativeModel({ model: modelName });
        try {
            let docVectors: number[][] = [];

            try {
                const docsResponse = await embeddingModel.batchEmbedContents({
                    requests: chunks.map((chunk) => ({
                        title: chunk.title,
                        taskType: TaskType.RETRIEVAL_DOCUMENT,
                        content: {
                            role: 'user',
                            parts: [{ text: chunk.text }],
                        },
                    })),
                }, { timeout: EMBEDDING_TIMEOUT_MS });
                docVectors = docsResponse.embeddings.map((entry) => entry.values);
            } catch {
                const docResponses = await Promise.all(
                    chunks.map((chunk) =>
                        embeddingModel.embedContent({
                            taskType: TaskType.RETRIEVAL_DOCUMENT,
                            title: chunk.title,
                            content: {
                                role: 'user',
                                parts: [{ text: chunk.text }],
                            },
                        }, { timeout: EMBEDDING_TIMEOUT_MS }),
                    ),
                );
                docVectors = docResponses.map((entry) => entry.embedding.values);
            }

            const queryResponse = await embeddingModel.embedContent({
                taskType: TaskType.RETRIEVAL_QUERY,
                content: {
                    role: 'user',
                    parts: [{ text: queryPrompt }],
                },
            }, { timeout: EMBEDDING_TIMEOUT_MS });

            const queryVector = queryResponse.embedding.values;

            return chunks
                .map((chunk, i) => ({
                    ...chunk,
                    similarity: cosineSimilarity(queryVector, docVectors[i] ?? []),
                }))
                .sort((a, b) => b.similarity - a.similarity);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown embedding model error';
            errors.push(`${modelName}: ${message}`);
        }
    }

    throw new Error(
        `No compatible embedding model available for this API key/project. Tried: ${EMBEDDING_MODEL_CANDIDATES.join(', ')}. Details: ${errors.join(' | ')}`,
    );
}

function buildGenerationPrompt(
    objectivePrompt: string,
    rankedChunks: RankedChunk[],
    salesProjection: SalesProjectionContext,
): string {
    const topChunks = rankedChunks.slice(0, TOP_CONTEXT_CHUNKS);
    const rankedContextBlock = topChunks
        .map(
            (chunk, i) => [
                `=== EMBEDDED CONTEXT ${i + 1}: ${chunk.title} ===`,
                `Similarity: ${chunk.similarity.toFixed(4)}`,
                chunk.text,
            ].join('\n'),
        )
        .join('\n\n');

    const scenarioRows = salesProjection.scenarios
        .map(
            (s) =>
                `${s.name}: unitSale=${inr(s.unitSalePriceExGst)}, taxableSales=${inr(s.taxableSales)}, profit=${inr(s.projectedProfit)}, margin=${pct(s.profitMarginPct)}, breakEvenUnits=${fmtN(s.breakEvenUnits)}, netGSTOutflow=${inr(s.netGstOutflowAfterItc)}`,
        )
        .join('\n');

    return `
You are a senior production planning and ERP analyst for an Indian manufacturing company.

Non-negotiable constraints:
1. All numbers from the embedded context are immutable simulated/ERP values. Do not alter them.
2. First treat this as a production feasibility decision.
3. Produce a full production plan and projected costs/profits based on sales scenarios.
4. Explicitly account for GST, stock readiness, and ERP finance/logistics constraints.

Objective prompt:
${objectivePrompt}

Pre-computed sales scenario baselines:
${scenarioRows}

Embedded semantic context:
${rankedContextBlock}

Return the answer under exactly these headings:
**1. Feasibility Verdict**
State GO / CONDITIONAL GO / NO-GO and the main reason using exact numbers.

**2. End-to-End Production Plan**
Give a phase-wise plan: procurement, production scheduling, quality checkpoints, dispatch readiness, and owner-by-owner actions.

**3. Projected Cost, Sales, and Profit**
Provide a markdown table with one row each for Conservative, Base, Aggressive using these columns:
Scenario | Units | Unit Sale Price (ex-GST) | Taxable Sales | Output GST | Gross Sales (incl GST) | Production Cost | Projected Profit | Profit Margin | Break-even Units | Net GST Outflow (after matched ITC)

**4. GST, Stock, and ERP Impact**
Summarize GST liability/ITC impact, stock risk, working-capital pressure, and finance/logistics blockers.

**5. Risk Register and Mitigations**
List top risks with severity and one specific mitigation for each.

**6. Final Recommendation**
Give the production feasibility decision for management in 3-5 sentences with the immediate next 48-hour actions.
`.trim();
}

export async function fetchGeminiInsights(result: SimResult): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local');

    const genAI = new GoogleGenerativeAI(apiKey);
    const erpContext = await loadERPContext();
    const salesProjection = buildSalesProjectionContext(result, erpContext);
    const objectivePrompt = buildSimPrompt(result);
    const chunks = buildEmbeddingChunks(result, erpContext, salesProjection);

    let rankedChunks: RankedChunk[];
    try {
        rankedChunks = await rankBySemanticRelevance(genAI, objectivePrompt, chunks);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown embedding error';
        throw new Error(`Embedding step failed: ${message}`);
    }

    const finalPrompt = buildGenerationPrompt(objectivePrompt, rankedChunks, salesProjection);

    const model = genAI.getGenerativeModel({
        model: GENERATION_MODEL,
        generationConfig: {
            temperature: 0.25,
            topP: 0.9,
            maxOutputTokens: 2200,
        },
    });

    const response = await model.generateContent(finalPrompt, { timeout: GENERATION_TIMEOUT_MS });
    const text = response.response.text();

    if (!text) throw new Error('Gemini returned an empty response.');
    return text;
}
