from __future__ import annotations

from production_simulation.api import simulate_production
from production_simulation.dummy_data import build_acceptance_mps, build_dummy_records


def format_currency(value: float) -> str:
    return f"INR {value:,.2f}"


def format_lakhs(value: float) -> str:
    return f"INR {value / 100000:,.2f} Lakhs"


def print_summary(result: dict) -> None:
    summary = result["summary"]
    print("\nSummary Cards")
    print("-" * 80)
    print(f"Total Cost: {format_currency(summary['total_cost'])} ({format_lakhs(summary['total_cost'])})")
    print(f"Total Days Required: {summary['total_days']:.2f}")
    print(f"Material Readiness: {summary['material_readiness_percent']:.2f}%")
    print(f"Estimated Completion Date: {summary['estimated_completion_date']}")
    print(f"Overload Alert: {'YES' if summary['overload_alert'] else 'NO'}")


def print_cost_breakdown(result: dict) -> None:
    costing = result["costing"]
    print("\nCost Breakdown")
    print("-" * 80)
    print(f"Labor Cost: {format_currency(costing['labor_cost'])}")
    print(f"Electricity Cost: {format_currency(costing['electricity_cost'])}")
    print(f"Material Cost: {format_currency(costing['material_cost'])}")
    print(f"Total Machine Energy: {costing['total_machine_energy_kwh']:,.2f} kWh")


def print_material_grid(result: dict) -> None:
    lines = result["mrp"]["lines"]
    print("\nMaterial Requirements (Required vs Available)")
    print("-" * 80)
    header = (
        f"{'Material':<14}"
        f"{'Required':>12}"
        f"{'Available':>12}"
        f"{'Shortage':>12}"
        f"{'Status':>10}"
        f"{'Unit Price':>14}"
        f"{'Req Cost':>14}"
    )
    print(header)
    print("-" * 80)

    for line in lines:
        print(
            f"{line['material_name']:<14}"
            f"{line['required_qty']:>12,.2f}"
            f"{line['available_qty']:>12,.2f}"
            f"{line['shortage_qty']:>12,.2f}"
            f"{line['status']:>10}"
            f"{line['unit_price']:>14,.2f}"
            f"{line['required_cost']:>14,.2f}"
        )


def main() -> None:
    records = build_dummy_records()
    mps = build_acceptance_mps()

    result = simulate_production(
        mps=mps,
        product_records=records["products"],
        bom_rows=records["bom_rows"],
        routing_rows=records["routing_rows"],
        material_records=records["materials"],
        machine_records=records["machines"],
        labor_hourly_rate=records["labor_hourly_rate"],
        energy_rate_per_kwh=records["energy_rate_per_kwh"],
        shift_hours=records["default_shift_hours"],
        worker_count=50,
        planning_start_date="2026-03-01",
    )

    print("Production Simulation & Forecasting - Function API Demo")
    print("=" * 80)
    print(f"MPS Input: {mps}")
    print(f"Shift Hours: {records['default_shift_hours']}")
    print("Worker Count: 50")

    print_summary(result)
    print_cost_breakdown(result)
    print_material_grid(result)


if __name__ == "__main__":
    main()
