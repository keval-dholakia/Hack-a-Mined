from __future__ import annotations

import calendar
import math
from collections import defaultdict
from datetime import date, timedelta
from typing import Dict, Mapping

from production_simulation.models import (
    CRPResult,
    CostResult,
    MRPResult,
    Material,
    MaterialRequirementLine,
    Product,
    ResourceMaster,
    RoutingSummary,
    SimulationInput,
    SimulationResult,
)


def explode_bom(
    mps: Mapping[str, int],
    products: Mapping[str, Product],
) -> Dict[str, float]:
    required: Dict[str, float] = defaultdict(float)

    for product_id, quantity in mps.items():
        if quantity <= 0:
            continue
        if product_id not in products:
            raise KeyError(f"Unknown product in MPS: {product_id}")

        product = products[product_id]
        for bom_item in product.bom:
            required[bom_item.material_id] += quantity * bom_item.quantity_per_unit

    return dict(required)


def explode_routing(
    mps: Mapping[str, int],
    products: Mapping[str, Product],
) -> RoutingSummary:
    total_man_hours = 0.0
    total_machine_hours = 0.0
    machine_hours_by_machine: Dict[str, float] = defaultdict(float)

    for product_id, quantity in mps.items():
        if quantity <= 0:
            continue
        if product_id not in products:
            raise KeyError(f"Unknown product in MPS: {product_id}")

        product = products[product_id]
        for step in product.routing:
            labor_hours = (quantity * step.labor_minutes) / 60.0
            machine_hours = (quantity * step.machine_minutes) / 60.0
            total_man_hours += labor_hours
            total_machine_hours += machine_hours
            machine_hours_by_machine[step.machine_id] += machine_hours

    return RoutingSummary(
        total_man_hours=total_man_hours,
        total_machine_hours=total_machine_hours,
        machine_hours_by_machine=dict(machine_hours_by_machine),
    )


def calculate_material_requirements(
    required_materials: Mapping[str, float],
    materials: Mapping[str, Material],
) -> MRPResult:
    lines = []

    for material_id, required_qty in sorted(required_materials.items()):
        if material_id not in materials:
            raise KeyError(f"Missing material master for: {material_id}")

        material = materials[material_id]
        available_qty = material.current_stock
        shortage_qty = max(0.0, required_qty - available_qty)

        lines.append(
            MaterialRequirementLine(
                material_id=material.material_id,
                material_name=material.name,
                unit=material.unit,
                required_qty=required_qty,
                available_qty=available_qty,
                shortage_qty=shortage_qty,
                unit_price=material.latest_purchase_price,
            )
        )

    ready_items = sum(1 for line in lines if line.ready)
    readiness_percent = (100.0 * ready_items / len(lines)) if lines else 100.0
    total_material_cost = sum(line.extended_cost for line in lines)

    return MRPResult(
        lines=lines,
        total_material_cost=total_material_cost,
        readiness_percent=readiness_percent,
    )


def calculate_capacity_requirements(
    routing_summary: RoutingSummary,
    workforce_count: int,
    shift_hours: float,
    planning_start_date: date,
) -> CRPResult:
    if workforce_count <= 0:
        raise ValueError("workforce_count must be greater than zero")
    if shift_hours <= 0:
        raise ValueError("shift_hours must be greater than zero")

    daily_capacity_hours = workforce_count * shift_hours
    required_hours = routing_summary.total_man_hours

    if required_hours <= 0:
        days_required = 0.0
        estimated_completion_date = planning_start_date
    else:
        days_required = required_hours / daily_capacity_hours
        full_days = math.ceil(days_required)
        estimated_completion_date = planning_start_date + timedelta(days=full_days - 1)

    _, month_last_day = calendar.monthrange(
        planning_start_date.year,
        planning_start_date.month,
    )
    month_end_date = date(planning_start_date.year, planning_start_date.month, month_last_day)
    remaining_days_in_month = (month_end_date - planning_start_date).days + 1
    monthly_available_hours = remaining_days_in_month * daily_capacity_hours

    overload_alert = required_hours > monthly_available_hours

    return CRPResult(
        total_man_hours_required=required_hours,
        days_required=days_required,
        estimated_completion_date=estimated_completion_date,
        month_end_date=month_end_date,
        monthly_available_hours=monthly_available_hours,
        overload_alert=overload_alert,
    )


def calculate_cost_estimation(
    mrp_result: MRPResult,
    routing_summary: RoutingSummary,
    resource_master: ResourceMaster,
) -> CostResult:
    labor_cost = routing_summary.total_man_hours * resource_master.labor_hourly_rate

    total_machine_energy_kwh = 0.0
    for machine_id, machine_hours in routing_summary.machine_hours_by_machine.items():
        machine = resource_master.machines.get(machine_id)
        if not machine:
            raise KeyError(f"Missing machine resource for: {machine_id}")
        total_machine_energy_kwh += machine_hours * machine.power_kw

    electricity_cost = total_machine_energy_kwh * resource_master.energy_rate_per_kwh
    material_cost = mrp_result.total_material_cost
    total_cost = labor_cost + electricity_cost + material_cost

    return CostResult(
        labor_cost=labor_cost,
        electricity_cost=electricity_cost,
        material_cost=material_cost,
        total_cost=total_cost,
        total_machine_energy_kwh=total_machine_energy_kwh,
    )


def run_production_simulation(
    simulation_input: SimulationInput,
    products: Mapping[str, Product],
    materials: Mapping[str, Material],
    resource_master: ResourceMaster,
) -> SimulationResult:
    required_materials = explode_bom(simulation_input.mps, products)
    routing_summary = explode_routing(simulation_input.mps, products)

    mrp_result = calculate_material_requirements(required_materials, materials)
    crp_result = calculate_capacity_requirements(
        routing_summary=routing_summary,
        workforce_count=simulation_input.worker_count,
        shift_hours=simulation_input.shift_hours,
        planning_start_date=simulation_input.planning_start_date,
    )
    cost_result = calculate_cost_estimation(
        mrp_result=mrp_result,
        routing_summary=routing_summary,
        resource_master=resource_master,
    )

    return SimulationResult(
        mrp=mrp_result,
        routing=routing_summary,
        crp=crp_result,
        costing=cost_result,
    )
