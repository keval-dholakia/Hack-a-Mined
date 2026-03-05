from __future__ import annotations

from typing import Any, Dict


def build_dummy_records() -> Dict[str, Any]:
    return {
        "products": [
            {"product_id": "ALTO", "name": "Alto"},
            {"product_id": "SWIFT", "name": "Swift"},
            {"product_id": "BALENO", "name": "Baleno"},
        ],
        "bom_rows": [
            {"product_id": "ALTO", "material_id": "STEEL_KG", "quantity_per_unit": 480},
            {"product_id": "ALTO", "material_id": "RUBBER_KG", "quantity_per_unit": 52},
            {"product_id": "ALTO", "material_id": "GLASS_SQM", "quantity_per_unit": 12},
            {"product_id": "ALTO", "material_id": "PLASTIC_KG", "quantity_per_unit": 38},
            {"product_id": "ALTO", "material_id": "ALUMINUM_KG", "quantity_per_unit": 45},
            {"product_id": "ALTO", "material_id": "ELECTRONICS_SET", "quantity_per_unit": 1},
            {"product_id": "ALTO", "material_id": "FABRIC_M", "quantity_per_unit": 18},
            {"product_id": "SWIFT", "material_id": "STEEL_KG", "quantity_per_unit": 620},
            {"product_id": "SWIFT", "material_id": "RUBBER_KG", "quantity_per_unit": 64},
            {"product_id": "SWIFT", "material_id": "GLASS_SQM", "quantity_per_unit": 14},
            {"product_id": "SWIFT", "material_id": "PLASTIC_KG", "quantity_per_unit": 45},
            {"product_id": "SWIFT", "material_id": "ALUMINUM_KG", "quantity_per_unit": 60},
            {"product_id": "SWIFT", "material_id": "ELECTRONICS_SET", "quantity_per_unit": 1},
            {"product_id": "SWIFT", "material_id": "FABRIC_M", "quantity_per_unit": 22},
            {"product_id": "BALENO", "material_id": "STEEL_KG", "quantity_per_unit": 710},
            {"product_id": "BALENO", "material_id": "RUBBER_KG", "quantity_per_unit": 70},
            {"product_id": "BALENO", "material_id": "GLASS_SQM", "quantity_per_unit": 16},
            {"product_id": "BALENO", "material_id": "PLASTIC_KG", "quantity_per_unit": 52},
            {"product_id": "BALENO", "material_id": "ALUMINUM_KG", "quantity_per_unit": 75},
            {"product_id": "BALENO", "material_id": "ELECTRONICS_SET", "quantity_per_unit": 1},
            {"product_id": "BALENO", "material_id": "FABRIC_M", "quantity_per_unit": 24},
        ],
        "routing_rows": [
            {"product_id": "ALTO", "operation": "Body Shop", "labor_minutes": 280, "machine_minutes": 190, "machine_id": "PRESS_01"},
            {"product_id": "ALTO", "operation": "Paint Shop", "labor_minutes": 140, "machine_minutes": 210, "machine_id": "PAINT_01"},
            {"product_id": "ALTO", "operation": "Assembly", "labor_minutes": 220, "machine_minutes": 120, "machine_id": "ASSY_01"},
            {"product_id": "ALTO", "operation": "Quality", "labor_minutes": 60, "machine_minutes": 30, "machine_id": "QC_01"},
            {"product_id": "SWIFT", "operation": "Body Shop", "labor_minutes": 350, "machine_minutes": 230, "machine_id": "PRESS_01"},
            {"product_id": "SWIFT", "operation": "Paint Shop", "labor_minutes": 170, "machine_minutes": 250, "machine_id": "PAINT_01"},
            {"product_id": "SWIFT", "operation": "Assembly", "labor_minutes": 260, "machine_minutes": 140, "machine_id": "ASSY_01"},
            {"product_id": "SWIFT", "operation": "Quality", "labor_minutes": 80, "machine_minutes": 40, "machine_id": "QC_01"},
            {"product_id": "BALENO", "operation": "Body Shop", "labor_minutes": 390, "machine_minutes": 260, "machine_id": "PRESS_01"},
            {"product_id": "BALENO", "operation": "Paint Shop", "labor_minutes": 180, "machine_minutes": 290, "machine_id": "PAINT_01"},
            {"product_id": "BALENO", "operation": "Assembly", "labor_minutes": 280, "machine_minutes": 160, "machine_id": "ASSY_01"},
            {"product_id": "BALENO", "operation": "Quality", "labor_minutes": 80, "machine_minutes": 50, "machine_id": "QC_01"},
        ],
        "materials": [
            {"material_id": "STEEL_KG", "name": "Steel", "unit": "kg", "current_stock": 43000, "latest_purchase_price": 72},
            {"material_id": "RUBBER_KG", "name": "Rubber", "unit": "kg", "current_stock": 5000, "latest_purchase_price": 120},
            {"material_id": "GLASS_SQM", "name": "Glass", "unit": "sqm", "current_stock": 900, "latest_purchase_price": 650},
            {"material_id": "PLASTIC_KG", "name": "Plastic", "unit": "kg", "current_stock": 3200, "latest_purchase_price": 95},
            {"material_id": "ALUMINUM_KG", "name": "Aluminum", "unit": "kg", "current_stock": 5000, "latest_purchase_price": 220},
            {"material_id": "ELECTRONICS_SET", "name": "Electronics", "unit": "set", "current_stock": 90, "latest_purchase_price": 18000},
            {"material_id": "FABRIC_M", "name": "Fabric", "unit": "m", "current_stock": 1400, "latest_purchase_price": 180},
        ],
        "machines": [
            {"machine_id": "PRESS_01", "name": "Press Line", "power_kw": 85},
            {"machine_id": "PAINT_01", "name": "Paint Booth", "power_kw": 120},
            {"machine_id": "ASSY_01", "name": "Assembly Conveyor", "power_kw": 65},
            {"machine_id": "QC_01", "name": "Quality Bench", "power_kw": 25},
        ],
        "labor_hourly_rate": 550.0,
        "energy_rate_per_kwh": 9.0,
        "default_shift_hours": 10.0,
    }


def build_acceptance_mps() -> Dict[str, int]:
    return {
        "ALTO": 20,
        "SWIFT": 30,
        "BALENO": 25,
    }
