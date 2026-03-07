-- ============================================================
-- IQC SEED DATA — Run in Supabase SQL Editor
-- Safe to re-run (uses ON CONFLICT DO NOTHING where possible)
-- ============================================================

-- ── 1. Vendors ────────────────────────────────────────────
INSERT INTO vendors (code, name, gstin, pan, contact_person, mobile, email, address, city, state, pincode, payment_terms, is_active)
VALUES
  ('V-001', 'Apex Metals Pvt Ltd',    '27AAPCS3923J1ZV', 'AAPCS3923J', 'Rohit Sharma',  '9876543210', 'rohit@apexmetals.com',    'Plot 12, MIDC, Bhosari',     'Pune',    'Maharashtra', '411026', 30, 1),
  ('V-002', 'Shree Polymers & Co.',   '29AABCS1234K1ZP', 'AABCS1234K', 'Sanjay Gupta',  '9812345670', 'sanjay@shreepolymers.in', '45 Industrial Area, Phase 2', 'Bangalore', 'Karnataka',   '560058', 45, 1),
  ('V-003', 'National Fasteners Ltd', '24AAACN5678L1ZQ', 'AAACN5678L', 'Mehul Patel',   '9731234560', 'mehul@natfast.com',       'Survey No. 88, Naroda GIDC',  'Ahmedabad','Gujarat',     '382330', 15, 1)
ON CONFLICT DO NOTHING;

-- ── 2. Products ───────────────────────────────────────────
INSERT INTO products (code, name, description, category, unit, hsn_code, gst_percent, purchase_price, sale_price, min_stock_level, current_stock, is_active)
VALUES
  ('P-001', 'MS Flat Bar 50×6mm',    '50mm×6mm mild steel flat bar, 6m length',     'Raw Material', 'KG',  '72111990', 18, 65.00,  80.00,  500,  1200, 1),
  ('P-002', 'HDPE Granules (Natural)','High-density polyethylene, natural grade',     'Raw Material', 'KG',  '39011010', 18, 110.00, 140.00, 200,   450, 1),
  ('P-003', 'M8 Hex Bolt 40mm (SS)', 'Stainless steel M8×40mm hex bolt, grade 304', 'Hardware',     'PCS', '73181590', 18,   4.50,   7.00, 1000,  3200, 1),
  ('P-004', 'MS Sheet 2mm (CRCA)',   '2mm cold-rolled close-annealed mild steel',    'Raw Material', 'KG',  '72091800', 18,  72.00,  92.00,  300,   800, 1)
ON CONFLICT DO NOTHING;

-- ── 3. Warehouse ──────────────────────────────────────────
INSERT INTO warehouses (code, name, address, city, state, manager_name, manager_mobile, is_active)
VALUES
  ('WH-001', 'Main Stores', 'Gate 1, Plot 7, MIDC Bhosari', 'Pune', 'Maharashtra', 'Arun Desai', '9922334455', 1)
ON CONFLICT DO NOTHING;

-- ── 4. Purchase Orders ────────────────────────────────────
-- We insert using subqueries so vendor names resolve correctly
WITH v AS (
  SELECT id, code FROM vendors WHERE code IN ('V-001', 'V-002', 'V-003')
)
INSERT INTO purchase_orders (po_no, vendor_id, po_date, valid_until, delivery_date, status)
SELECT po_no, vendor_id, po_date::date, valid_until::date, delivery_date::date, status
FROM (
  VALUES
    ('PO-2024-001', (SELECT id FROM v WHERE code='V-001'), '2024-02-01', '2024-02-28', '2024-02-15', 'Received'),
    ('PO-2024-002', (SELECT id FROM v WHERE code='V-002'), '2024-02-10', '2024-03-10', '2024-02-25', 'Received'),
    ('PO-2024-003', (SELECT id FROM v WHERE code='V-003'), '2024-03-01', '2024-03-31', '2024-03-10', 'Partial')
) AS t(po_no, vendor_id, po_date, valid_until, delivery_date, status)
ON CONFLICT DO NOTHING;

-- ── 5. PO Items ───────────────────────────────────────────
INSERT INTO po_items (po_id, product_id, quantity, rate, gst_percent, expected_date, received_qty)
SELECT po.id, pr.id, qty, rate, gst, exp_date::date, recv_qty
FROM (
  VALUES
    ('PO-2024-001', 'P-001', 500,  65.00, 18, '2024-02-15', 500),
    ('PO-2024-001', 'P-004', 200,  72.00, 18, '2024-02-15', 200),
    ('PO-2024-002', 'P-002', 300, 110.00, 18, '2024-02-25', 300),
    ('PO-2024-003', 'P-003',2000,   4.50, 18, '2024-03-10', 1000)
) AS t(po_no, prod_code, qty, rate, gst, exp_date, recv_qty)
JOIN purchase_orders po ON po.po_no = t.po_no
JOIN products         pr ON pr.code  = t.prod_code
ON CONFLICT DO NOTHING;

-- ── 6. GRNs ───────────────────────────────────────────────
INSERT INTO grns (grn_no, po_id, vendor_id, vendor_challan_no, gate_entry_date, vehicle_no, warehouse_id, status)
SELECT
  t.grn_no,
  po.id,
  v.id,
  t.challan_no,
  t.gate_date::date,
  t.vehicle_no,
  wh.id,
  t.status
FROM (
  VALUES
    ('GRN-2024-001', 'PO-2024-001', 'V-001', 'APX/CH/2024/088', '2024-02-14', 'MH12AB1234', 'Pending'),
    ('GRN-2024-002', 'PO-2024-002', 'V-002', 'SP/CH/2024/045',  '2024-02-24', 'KA03CD5678', 'Pending'),
    ('GRN-2024-003', 'PO-2024-003', 'V-003', 'NF/CH/2024/112',  '2024-03-09', 'GJ05EF9012', 'Pending')
) AS t(grn_no, po_no, vendor_code, challan_no, gate_date, vehicle_no, status)
JOIN purchase_orders po ON po.po_no      = t.po_no
JOIN vendors          v  ON v.code        = t.vendor_code
JOIN warehouses       wh ON wh.code       = 'WH-001'
ON CONFLICT DO NOTHING;

-- ── 7. GRN Items ──────────────────────────────────────────
INSERT INTO grn_items (grn_id, product_id, ordered_qty, received_qty, accepted_qty, rejected_qty, sample_size, rack_bin, batch_no)
SELECT
  grn.id,
  pr.id,
  t.ordered_qty,
  t.received_qty,
  NULL,   -- will be filled after IQC
  NULL,
  NULL,
  t.rack_bin,
  t.batch_no
FROM (
  VALUES
    ('GRN-2024-001', 'P-001', 500, 500, 'A-01', 'BATCH-APX-24001'),
    ('GRN-2024-001', 'P-004', 200, 200, 'A-02', 'BATCH-APX-24002'),
    ('GRN-2024-002', 'P-002', 300, 295, 'B-01', 'BATCH-SP-24010'),
    ('GRN-2024-003', 'P-003',2000,1000, 'C-01', 'BATCH-NF-24007')
) AS t(grn_no, prod_code, ordered_qty, received_qty, rack_bin, batch_no)
JOIN grns     grn ON grn.grn_no = t.grn_no
JOIN products pr  ON pr.code    = t.prod_code
ON CONFLICT DO NOTHING;

-- ── 8. IQC Entries (2-3 examples) ────────────────────────
-- Uses the Super Admin user (raj@techmicra.com) as checker
INSERT INTO iqc_entries
  (grn_id, product_id, total_qty, sample_size, accepted_qty, rejected_qty, visual_check, dimension_check, result, checked_by)
SELECT
  grn.id,
  pr.id,
  t.total_qty,
  t.sample_size,
  t.accepted_qty,
  t.rejected_qty,
  t.visual_check,
  t.dimension_check,
  t.result,
  u.id
FROM (
  VALUES
    -- GRN-001, MS Flat Bar — all good, Pass
    ('GRN-2024-001', 'P-001', 500, 50, 50, 0, true,  true,  'Pass'),
    -- GRN-001, MS Sheet — minor surface rust on 2 pieces, Rework
    ('GRN-2024-001', 'P-004', 200, 20, 18, 2, false, true,  'Rework'),
    -- GRN-002, HDPE Granules — 15 lumps in sample, Fail
    ('GRN-2024-002', 'P-002', 295, 30, 15, 15, true, false, 'Fail')
) AS t(grn_no, prod_code, total_qty, sample_size, accepted_qty, rejected_qty, visual_check, dimension_check, result)
JOIN grns    grn ON grn.grn_no = t.grn_no
JOIN products pr ON pr.code    = t.prod_code
JOIN users    u  ON u.email    = 'raj@techmicra.com'
ON CONFLICT DO NOTHING;

-- ── 9. Update GRN status after IQC ───────────────────────
-- GRN-001 and GRN-002 have been inspected
UPDATE grns SET status = 'IQC Done'
WHERE grn_no IN ('GRN-2024-001', 'GRN-2024-002');

-- ── VERIFY — run these SELECT statements to confirm ───────
-- SELECT grn_no, status FROM grns ORDER BY grn_no;
-- SELECT i.id, g.grn_no, p.name, i.result, i.accepted_qty, i.rejected_qty FROM iqc_entries i JOIN grns g ON g.id=i.grn_id JOIN products p ON p.id=i.product_id;
