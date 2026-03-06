// src/types/simulation.ts
// TypeScript types for the Simulation module.
// MRPLine, MRPResult etc. are re-exported from simulationEngine for
// convenience — import from here in UI components.

export type {
    MRPLine,
    MRPResult,
    RoutingResult,
    CRPResult,
    CostResult,
    SimResult,
} from '@/lib/simulationEngine';

// UI-layer types

export interface MPSRow {
    pid: string;
    qty: number;
}

export interface SimParams {
    mps: MPSRow[];
    shift: number;
    workers: number;
    start: string;       // ISO date string
    laborRate: number;
    energyRate: number;
}