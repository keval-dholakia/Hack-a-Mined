-- ============================================================
-- PQC SEED DATA — Run in Supabase SQL Editor
-- Depends on: products (from seed_iqc.sql), users table
-- Safe to re-run (ON CONFLICT DO NOTHING)
-- ============================================================

-- ── 1. BOM Headers (needed by Route Cards) ────────────────
INSERT INTO bom_headers (product_id, version, process_name, machine, output_qty, man_hours_per_unit, machine_hours_per_unit, is_active)
SELECT p.id, 1, proc_name, machine, output_qty, man_hrs, mach_hrs, 1
FROM (
  VALUES
    ('P-001', 'MS Flat Bar Fabrication',   'Shearing Machine',  100, 0.05, 0.08),
    ('P-003', 'Fastener Assembly',          'Assembly Line A',   500, 0.02, 0.00),
    ('P-004', 'MS Sheet Metal Fabrication', 'Press Brake',        50, 0.10, 0.15)
) AS t(prod_code, proc_name, machine, output_qty, man_hrs, mach_hrs)
JOIN products p ON p.code = t.prod_code
ON CONFLICT DO NOTHING;

-- ── 2. Route Cards ────────────────────────────────────────
INSERT INTO route_cards
  (route_card_no, product_id, bom_id, batch_no, plan_qty, produced_qty, rejection_qty,
   scrap_generated, start_date, end_date, status)
SELECT
  t.rc_no,
  p.id,
  b.id,
  t.batch_no,
  t.plan_qty,
  t.produced_qty,
  t.rejection_qty,
  t.scrap,
  t.start_date::date,
  t.end_date::date,
  t.status
FROM (
  VALUES
    ('RC-2024-001', 'P-001', '2024-03-01', 200, 180, 5, 2.5, '2024-03-01', '2024-03-05', 'In Progress'),
    ('RC-2024-002', 'P-004', '2024-03-06', 100,  60, 2, 1.0, '2024-03-06', '2024-03-10', 'Open'),
    ('RC-2024-003', 'P-003', '2024-03-08', 500, 420, 8, 0.0, '2024-03-08', '2024-03-12', 'In Progress')
) AS t(rc_no, prod_code, batch_no, plan_qty, produced_qty, rejection_qty, scrap, start_date, end_date, status)
JOIN products     p ON p.code = t.prod_code
JOIN bom_headers  b ON b.product_id = p.id
ON CONFLICT DO NOTHING;

-- ── 3. Material Issues (optional but realistic) ───────────
-- (Skipped to keep the seed minimal — PQC does not depend on this)

-- ── 4. PQC Entries (3 examples across different stages) ───
INSERT INTO pqc_entries
  (route_card_id, product_id, stage_name, operator_id, result, remarks)
SELECT
  rc.id,
  p.id,
  t.stage_name,
  u.id,
  t.result,
  t.remarks
FROM (
  VALUES
    -- RC-001: Cutting stage passed clean
    ('RC-2024-001', 'P-001', 'Cutting',
     'Pass',
     'All cuts within ±0.5mm tolerance. No burrs observed.'),

    -- RC-001: Welding has minor porosity, rework flagged
    ('RC-2024-001', 'P-001', 'Welding',
     'Rework',
     'Porosity found on 4 joints in batch. Re-weld and grind before next stage.'),

    -- RC-003: Assembly final inspection — one dimension issue for 8 pcs
    ('RC-2024-003', 'P-003', 'Assembly',
     'Fail',
     'Thread depth out of spec on 8 bolts (M8 thread not fully formed). Batch quarantined for vendor NCR.')

) AS t(rc_no, prod_code, stage_name, result, remarks)
JOIN route_cards rc ON rc.route_card_no = t.rc_no
JOIN products     p ON p.code           = t.prod_code
JOIN users        u ON u.email          = 'raj@techmicra.com'
ON CONFLICT DO NOTHING;

-- ── VERIFY ────────────────────────────────────────────────
-- SELECT rc.route_card_no, p.name, pq.stage_name, pq.result, pq.remarks
-- FROM pqc_entries pq
-- JOIN route_cards rc ON rc.id = pq.route_card_id
-- JOIN products     p  ON p.id  = pq.product_id
-- ORDER BY pq.created_at;

-- SELECT route_card_no, batch_no, status FROM route_cards ORDER BY route_card_no;
