from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Any, Dict, Mapping, Sequence

from production_simulation.engine import run_production_simulation
from production_simulation.models import (
    BOMItem,
    Machine,
    Material,
    Product,
    ResourceMaster,
    RoutingStep,
    SimulationInput,
    SimulationResult,
)


def _parse_date(value: date | str) -> date:
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def build_products(
    product_records: Sequence[Mapping[str, Any]],
    bom_rows: Sequence[Mapping[str, Any]],
    routing_rows: Sequence[Mapping[str, Any]],
) -> Dict[str, Product]:
    names_by_product_id: Dict[str, str] = {}
    for row in product_records:
        product_id = str(row["product_id"])
        names_by_product_id[product_id] = str(row.get("name", product_id))

    bom_by_product_id: Dict[str, list[BOMItem]] = defaultdict(list)
    for row in bom_rows:
        product_id = str(row["product_id"])
        names_by_product_id.setdefault(product_id, product_id)
        bom_by_product_id[product_id].append(
            BOMItem(
                material_id=str(row["material_id"]),
                quantity_per_unit=float(row["quantity_per_unit"]),
            )
        )

    routing_by_product_id: Dict[str, list[RoutingStep]] = defaultdict(list)
    for row in routing_rows:
        product_id = str(row["product_id"])
        names_by_product_id.setdefault(product_id, product_id)
        routing_by_product_id[product_id].append(
            RoutingStep(
                operation=str(row.get("operation", "Operation")),
                labor_minutes=float(row["labor_minutes"]),
                machine_minutes=float(row["machine_minutes"]),
                machine_id=str(row["machine_id"]),
            )
        )

    products: Dict[str, Product] = {}
    for product_id, name in names_by_product_id.items():
        products[product_id] = Product(
            product_id=product_id,
            name=name,
            bom=bom_by_product_id.get(product_id, []),
            routing=routing_by_product_id.get(product_id, []),
        )
    return products


def build_materials(material_records: Sequence[Mapping[str, Any]]) -> Dict[str, Material]:
    materials: Dict[str, Material] = {}
    for row in material_records:
        material = Material(
            material_id=str(row["material_id"]),
            name=str(row.get("name", row["material_id"])),
            unit=str(row.get("unit", "unit")),
            current_stock=float(row["current_stock"]),
            latest_purchase_price=float(row["latest_purchase_price"]),
        )
        materials[material.material_id] = material
    return materials


def build_resource_master(
    machine_records: Sequence[Mapping[str, Any]],
    labor_hourly_rate: float,
    energy_rate_per_kwh: float,
) -> ResourceMaster:
    machines: Dict[str, Machine] = {}
    for row in machine_records:
        machine = Machine(
            machine_id=str(row["machine_id"]),
            name=str(row.get("name", row["machine_id"])),
            power_kw=float(row["power_kw"]),
        )
        machines[machine.machine_id] = machine

    return ResourceMaster(
        labor_hourly_rate=float(labor_hourly_rate),
        energy_rate_per_kwh=float(energy_rate_per_kwh),
        machines=machines,
    )


def simulation_result_to_dict(result: SimulationResult) -> Dict[str, Any]:
    return {
        "summary": {
            "total_cost": result.costing.total_cost,
            "total_days": result.crp.days_required,
            "material_readiness_percent": result.mrp.readiness_percent,
            "estimated_completion_date": result.crp.estimated_completion_date.isoformat(),
            "overload_alert": result.crp.overload_alert,
        },
        "mrp": {
            "total_material_cost": result.mrp.total_material_cost,
            "readiness_percent": result.mrp.readiness_percent,
            "lines": [
                {
                    "material_id": line.material_id,
                    "material_name": line.material_name,
                    "unit": line.unit,
                    "required_qty": line.required_qty,
                    "available_qty": line.available_qty,
                    "shortage_qty": line.shortage_qty,
                    "status": "READY" if line.ready else "SHORT",
                    "unit_price": line.unit_price,
                    "required_cost": line.extended_cost,
                }
                for line in result.mrp.lines
            ],
        },
        "routing": {
            "total_man_hours": result.routing.total_man_hours,
            "total_machine_hours": result.routing.total_machine_hours,
            "machine_hours_by_machine": result.routing.machine_hours_by_machine,
        },
        "crp": {
            "total_man_hours_required": result.crp.total_man_hours_required,
            "days_required": result.crp.days_required,
            "estimated_completion_date": result.crp.estimated_completion_date.isoformat(),
            "month_end_date": result.crp.month_end_date.isoformat(),
            "monthly_available_hours": result.crp.monthly_available_hours,
            "overload_alert": result.crp.overload_alert,
        },
        "costing": {
            "labor_cost": result.costing.labor_cost,
            "electricity_cost": result.costing.electricity_cost,
            "material_cost": result.costing.material_cost,
            "total_cost": result.costing.total_cost,
            "total_machine_energy_kwh": result.costing.total_machine_energy_kwh,
        },
    }


def simulate_production(
    *,
    mps: Mapping[str, int],
    product_records: Sequence[Mapping[str, Any]],
    bom_rows: Sequence[Mapping[str, Any]],
    routing_rows: Sequence[Mapping[str, Any]],
    material_records: Sequence[Mapping[str, Any]],
    machine_records: Sequence[Mapping[str, Any]],
    labor_hourly_rate: float,
    energy_rate_per_kwh: float,
    shift_hours: float,
    worker_count: int,
    planning_start_date: date | str,
) -> Dict[str, Any]:
    products = build_products(product_records, bom_rows, routing_rows)
    materials = build_materials(material_records)
    resource_master = build_resource_master(
        machine_records=machine_records,
        labor_hourly_rate=labor_hourly_rate,
        energy_rate_per_kwh=energy_rate_per_kwh,
    )

    simulation_input = SimulationInput(
        mps={str(product_id): int(quantity) for product_id, quantity in mps.items()},
        shift_hours=float(shift_hours),
        worker_count=int(worker_count),
        planning_start_date=_parse_date(planning_start_date),
    )

    result = run_production_simulation(
        simulation_input=simulation_input,
        products=products,
        materials=materials,
        resource_master=resource_master,
    )
    return simulation_result_to_dict(result)
