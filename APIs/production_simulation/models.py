from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Dict, List


@dataclass(frozen=True)
class BOMItem:
    material_id: str
    quantity_per_unit: float


@dataclass(frozen=True)
class RoutingStep:
    operation: str
    labor_minutes: float
    machine_minutes: float
    machine_id: str


@dataclass(frozen=True)
class Product:
    product_id: str
    name: str
    bom: List[BOMItem]
    routing: List[RoutingStep]

    @property
    def labor_hours_per_unit(self) -> float:
        return sum(step.labor_minutes for step in self.routing) / 60.0

    @property
    def machine_hours_per_unit(self) -> float:
        return sum(step.machine_minutes for step in self.routing) / 60.0


@dataclass(frozen=True)
class Material:
    material_id: str
    name: str
    unit: str
    current_stock: float
    latest_purchase_price: float


@dataclass(frozen=True)
class Machine:
    machine_id: str
    name: str
    power_kw: float


@dataclass(frozen=True)
class ResourceMaster:
    labor_hourly_rate: float
    energy_rate_per_kwh: float
    machines: Dict[str, Machine]


@dataclass(frozen=True)
class ShiftMaster:
    default_shift_hours: float


@dataclass(frozen=True)
class SimulationInput:
    mps: Dict[str, int]
    shift_hours: float
    worker_count: int
    planning_start_date: date


@dataclass(frozen=True)
class MaterialRequirementLine:
    material_id: str
    material_name: str
    unit: str
    required_qty: float
    available_qty: float
    shortage_qty: float
    unit_price: float

    @property
    def ready(self) -> bool:
        return self.shortage_qty <= 0

    @property
    def extended_cost(self) -> float:
        return self.required_qty * self.unit_price


@dataclass(frozen=True)
class MRPResult:
    lines: List[MaterialRequirementLine]
    total_material_cost: float
    readiness_percent: float


@dataclass(frozen=True)
class RoutingSummary:
    total_man_hours: float
    total_machine_hours: float
    machine_hours_by_machine: Dict[str, float]


@dataclass(frozen=True)
class CRPResult:
    total_man_hours_required: float
    days_required: float
    estimated_completion_date: date
    month_end_date: date
    monthly_available_hours: float
    overload_alert: bool


@dataclass(frozen=True)
class CostResult:
    labor_cost: float
    electricity_cost: float
    material_cost: float
    total_cost: float
    total_machine_energy_kwh: float


@dataclass(frozen=True)
class SimulationResult:
    mrp: MRPResult
    routing: RoutingSummary
    crp: CRPResult
    costing: CostResult
