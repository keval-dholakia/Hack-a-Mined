// ─────────────────────────────────────────────────────────────────────────────
// Master Seed Script  –  Vendors · Products · Transporters · Warehouses
//
//   Run:  node scripts/seed-all-masters.mjs
//
//   Each table uses ON CONFLICT (code) DO NOTHING so the script is safe
//   to re-run without duplicating records.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ogolwsyvogwknidsxzgk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_8FG-qXp0yonvLrgA1rqGiQ_rPmzRInG'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Shared lookup data ────────────────────────────────────────────────────────

const STATES = [
    'Gujarat', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Tamil Nadu',
    'Uttar Pradesh', 'Delhi', 'West Bengal', 'Punjab', 'Haryana',
    'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Bihar',
]

const CITIES = {
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Karol Bagh', 'Lajpat Nagar'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kakinada'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
}

const STREETS = [
    'MG Road', 'Ring Road', 'Industrial Area', 'Market Street',
    'Station Road', 'Gandhi Nagar', 'Nehru Colony', 'GIDC Phase-2',
    'Naroda Industrial Estate', 'Vatva GIDC', 'MIDC Estate', 'Phase-1 SIDCO',
]

const FIRST_NAMES = [
    'Raj', 'Amit', 'Priya', 'Sunita', 'Vikram', 'Neha', 'Ravi', 'Kavita',
    'Suresh', 'Anjali', 'Deepak', 'Pooja', 'Anil', 'Rekha', 'Sanjay',
    'Meena', 'Rahul', 'Divya', 'Ajay', 'Shweta', 'Harish', 'Nidhi',
]

const LAST_NAMES = [
    'Patel', 'Shah', 'Mehta', 'Sharma', 'Gupta', 'Singh', 'Verma', 'Joshi',
    'Nair', 'Pillai', 'Reddy', 'Rao', 'Iyer', 'Pandey', 'Mishra', 'Kapoor',
]

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank',
    'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank',
    'Union Bank of India', 'Canara Bank', 'YES Bank']

const BANK_PREFIXES = {
    'HDFC Bank': 'HDFC', 'ICICI Bank': 'ICIC', 'State Bank of India': 'SBIN',
    'Axis Bank': 'UTIB', 'Kotak Mahindra Bank': 'KKBK', 'Bank of Baroda': 'BARB',
    'Punjab National Bank': 'PUNB', 'Union Bank of India': 'UBIN',
    'Canara Bank': 'CNRB', 'YES Bank': 'YESB'
}

const STATE_CODE = {
    'Bihar': 10, 'West Bengal': 19, 'Madhya Pradesh': 23,
    'Gujarat': 24, 'Maharashtra': 27, 'Andhra Pradesh': 28,
    'Karnataka': 29, 'Kerala': 32, 'Tamil Nadu': 33, 'Telangana': 36,
    'Uttar Pradesh': 9, 'Rajasthan': 8, 'Punjab': 3, 'Haryana': 6, 'Delhi': 7,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo
const pad = (n, w = 3) => String(n).padStart(w, '0')

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const alpha = (n) => ALPHA[n % 26]

function makePAN(i) {
    return `${alpha(i)}${alpha(i + 3)}${alpha(i + 7)}${alpha(i + 11)}${alpha(i + 15)}${rand(1000, 9999)}${alpha(i + 2)}`
}
function makeGSTIN(state, pan) {
    return `${String(STATE_CODE[state] ?? 24).padStart(2, '0')}${pan}1ZV`
}
function makeMobile(i) {
    const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '88', '87', '86', '85', '84']
    return `${prefixes[i % prefixes.length]}${String(rand(10000000, 99999999))}`
}
function makePincode(state) {
    const RANGES = {
        'Gujarat': [380001, 396460], 'Maharashtra': [400001, 445402], 'Rajasthan': [301001, 345034],
        'Karnataka': [560001, 591346], 'Tamil Nadu': [600001, 643253], 'Uttar Pradesh': [201001, 285205],
        'Delhi': [110001, 110096], 'West Bengal': [700001, 743700], 'Punjab': [140001, 152128],
        'Haryana': [121001, 136136], 'Madhya Pradesh': [450001, 488448], 'Andhra Pradesh': [500001, 535591],
        'Telangana': [500001, 509412], 'Kerala': [670001, 695615], 'Bihar': [800001, 855117],
    }
    const [lo, hi] = RANGES[state] ?? [110001, 110096]
    return String(rand(lo, hi))
}
function makeAddress(state) {
    const city = CITIES[state][rand(0, CITIES[state].length - 1)]
    return `${rand(1, 500)}, ${pick(STREETS)}, ${city}`
}
function makeIFSC(bankName) {
    const prefix = BANK_PREFIXES[bankName] ?? 'HDFC'
    return `${prefix}0${String(rand(100000, 999999))}`
}
function makeAccountNo() {
    return String(rand(100000000000, 999999999999))
}

// ── Insert helper with batching ───────────────────────────────────────────────

async function insertBatched(table, rows, label) {
    console.log(`\n📦  Seeding ${label} (${rows.length} rows) → ${table}`)
    const BATCH = 25
    let inserted = 0
    for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH)
        const { error } = await supabase
            .from(table)
            .insert(batch)

        if (error) {
            console.error(`  ❌ Batch ${Math.floor(i / BATCH) + 1} failed:`, error.message)
        } else {
            inserted += batch.length
            console.log(`  ✅ Batch ${Math.floor(i / BATCH) + 1} inserted (${batch.length} rows)`)
        }
    }
    console.log(`  → ${inserted}/${rows.length} rows inserted into "${table}"`)
}

// ════════════════════════════════════════════════════════════════════════════
// 1. VENDORS  (100 records)
//    Table  : vendors
//    Fields : code, name, gstin, pan, contact_person, mobile, email,
//             address, city, state, pincode,
//             bank_name, bank_account, bank_ifsc, payment_terms, is_active
// ════════════════════════════════════════════════════════════════════════════

const VENDOR_PREFIXES = [
    'Shree', 'Sai', 'Balaji', 'Ganesh', 'Jay', 'Mahadev', 'Laxmi', 'Krishna',
    'Om', 'Surya', 'National', 'Global', 'Prime', 'Apex', 'Star', 'Pioneer',
    'Excel', 'Supreme', 'United', 'Allied',
]
const VENDOR_TYPES = [
    'Industries', 'Enterprises', 'Suppliers', 'Traders', 'Corporation',
    'Manufacturing', 'Components', 'Engineering', 'Materials', 'Solutions',
]

const vendors = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1
    const state = STATES[i % STATES.length]
    const city = CITIES[state][i % CITIES[state].length]
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[i % LAST_NAMES.length]
    const pan = makePAN(i + 200)   // offset to avoid colliding with customer PANs
    const bank = pick(BANKS)

    return {
        code: `VEND-${pad(num)}`,
        name: `${VENDOR_PREFIXES[i % VENDOR_PREFIXES.length]} ${VENDOR_TYPES[i % VENDOR_TYPES.length]}`,
        gstin: makeGSTIN(state, pan),
        pan,
        contact_person: `${first} ${last}`,
        mobile: makeMobile(i + 100),
        email: `${first.toLowerCase()}.${last.toLowerCase()}${num}@vendor.in`,
        address: makeAddress(state),
        city,
        state,
        pincode: makePincode(state),
        bank_name: bank,
        bank_account: makeAccountNo(),
        bank_ifsc: makeIFSC(bank),
        payment_terms: pick([15, 30, 45, 60, 90]),
        is_active: 1,
    }
})

// ════════════════════════════════════════════════════════════════════════════
// 2. PRODUCTS  (100 records)
//    Table  : products
//    Fields : code, name, description, category, unit, hsn_code,
//             gst_percent, purchase_price, sale_price,
//             min_stock_level, current_stock, is_active
// ════════════════════════════════════════════════════════════════════════════

const CATEGORIES = ['Raw Material', 'Finished Good', 'Semi-Finished', 'Consumable', 'Spare Part', 'Packaging', 'Service']
const UNITS = ['PCS', 'KG', 'MTR', 'LTR', 'BOX', 'SET', 'NOS', 'TON', 'SQM', 'RMT']
const GST_RATES = [0, 5, 12, 18, 28]

// Realistic product catalogue (manufacturing ERP context)
const PRODUCT_CATALOGUE = [
    // Raw Materials
    { name: 'Cold Rolled Steel Sheet', category: 'Raw Material', unit: 'KG', hsn: '7209', buyPrice: 75, sellPrice: 87, minStock: 500 },
    { name: 'Hot Rolled Coil 3mm', category: 'Raw Material', unit: 'KG', hsn: '7208', buyPrice: 68, sellPrice: 79, minStock: 1000 },
    { name: 'Stainless Steel 304 Sheet', category: 'Raw Material', unit: 'KG', hsn: '7219', buyPrice: 210, sellPrice: 245, minStock: 200 },
    { name: 'Aluminium Ingot 6061', category: 'Raw Material', unit: 'KG', hsn: '7601', buyPrice: 190, sellPrice: 220, minStock: 300 },
    { name: 'Copper Rod 10mm', category: 'Raw Material', unit: 'KG', hsn: '7407', buyPrice: 680, sellPrice: 750, minStock: 100 },
    { name: 'Mild Steel Flat Bar 50x6', category: 'Raw Material', unit: 'MTR', hsn: '7216', buyPrice: 85, sellPrice: 98, minStock: 200 },
    { name: 'ERW Pipe 25mm x 2mm', category: 'Raw Material', unit: 'MTR', hsn: '7306', buyPrice: 120, sellPrice: 140, minStock: 150 },
    { name: 'HDPE Granules', category: 'Raw Material', unit: 'KG', hsn: '3901', buyPrice: 95, sellPrice: 110, minStock: 500 },
    { name: 'PP Granules Natural', category: 'Raw Material', unit: 'KG', hsn: '3902', buyPrice: 90, sellPrice: 105, minStock: 500 },
    { name: 'ABS Plastic Granules', category: 'Raw Material', unit: 'KG', hsn: '3903', buyPrice: 130, sellPrice: 152, minStock: 300 },
    // Semi-Finished
    { name: 'MS Angle 50x50x5', category: 'Semi-Finished', unit: 'MTR', hsn: '7216', buyPrice: 95, sellPrice: 112, minStock: 100 },
    { name: 'Stamped Bracket Assembly', category: 'Semi-Finished', unit: 'PCS', hsn: '8302', buyPrice: 45, sellPrice: 58, minStock: 200 },
    { name: 'Welded Frame Sub-Assembly', category: 'Semi-Finished', unit: 'SET', hsn: '7308', buyPrice: 850, sellPrice: 1020, minStock: 50 },
    { name: 'Powder Coated Panel 600x900', category: 'Semi-Finished', unit: 'PCS', hsn: '7610', buyPrice: 380, sellPrice: 455, minStock: 30 },
    { name: 'Turned Shaft 25mm Dia', category: 'Semi-Finished', unit: 'PCS', hsn: '8483', buyPrice: 180, sellPrice: 215, minStock: 100 },
    // Finished Goods
    { name: 'Electric Motor 1.5 HP', category: 'Finished Good', unit: 'PCS', hsn: '8501', buyPrice: 3200, sellPrice: 3850, minStock: 20 },
    { name: 'Control Panel 32A', category: 'Finished Good', unit: 'PCS', hsn: '8537', buyPrice: 12000, sellPrice: 14500, minStock: 10 },
    { name: 'Hydraulic Cylinder 80mm', category: 'Finished Good', unit: 'PCS', hsn: '8412', buyPrice: 8500, sellPrice: 10200, minStock: 15 },
    { name: 'Conveyor Belt 600mm Wide', category: 'Finished Good', unit: 'MTR', hsn: '5910', buyPrice: 950, sellPrice: 1150, minStock: 50 },
    { name: 'Pneumatic Cylinder 50x100', category: 'Finished Good', unit: 'PCS', hsn: '8412', buyPrice: 2800, sellPrice: 3360, minStock: 20 },
    // Spare Parts
    { name: 'Deep Groove Ball Bearing 6205', category: 'Spare Part', unit: 'PCS', hsn: '8482', buyPrice: 125, sellPrice: 160, minStock: 100 },
    { name: 'Taper Roller Bearing 30205', category: 'Spare Part', unit: 'PCS', hsn: '8482', buyPrice: 210, sellPrice: 265, minStock: 50 },
    { name: 'V-Belt A-42', category: 'Spare Part', unit: 'PCS', hsn: '4010', buyPrice: 85, sellPrice: 110, minStock: 50 },
    { name: 'Oil Seal 40x60x8', category: 'Spare Part', unit: 'PCS', hsn: '8484', buyPrice: 45, sellPrice: 60, minStock: 100 },
    { name: 'Hex Bolt M12x50 Grade 8.8', category: 'Spare Part', unit: 'PCS', hsn: '7318', buyPrice: 8, sellPrice: 12, minStock: 500 },
    // Consumables
    { name: 'MIG Welding Wire 0.8mm 5Kg', category: 'Consumable', unit: 'BOX', hsn: '8311', buyPrice: 650, sellPrice: 800, minStock: 20 },
    { name: 'Cutting Disc 230mm', category: 'Consumable', unit: 'PCS', hsn: '6804', buyPrice: 35, sellPrice: 50, sellPrice: 50, minStock: 100 },
    { name: 'Safety Gloves – Leather', category: 'Consumable', unit: 'PCS', hsn: '6216', buyPrice: 48, sellPrice: 70, minStock: 50 },
    { name: 'Lubricating Oil EP-90 20L', category: 'Consumable', unit: 'LTR', hsn: '2710', buyPrice: 185, sellPrice: 225, minStock: 50 },
    { name: 'Solvent / Thinner 5L', category: 'Consumable', unit: 'LTR', hsn: '3814', buyPrice: 220, sellPrice: 270, minStock: 30 },
    // Packaging
    { name: 'Wooden Packing Crate 1.2x0.8', category: 'Packaging', unit: 'PCS', hsn: '4415', buyPrice: 320, sellPrice: 400, minStock: 30 },
    { name: 'Corrugated Box 400x300x300', category: 'Packaging', unit: 'PCS', hsn: '4819', buyPrice: 28, sellPrice: 38, minStock: 200 },
    { name: 'Bubble Wrap Roll 1m x 100m', category: 'Packaging', unit: 'NOS', hsn: '3921', buyPrice: 1200, sellPrice: 1500, minStock: 10 },
    { name: 'Stretch Film 500mm x 300m', category: 'Packaging', unit: 'NOS', hsn: '3919', buyPrice: 380, sellPrice: 480, minStock: 20 },
    { name: 'PP Banding Strap 12mm', category: 'Packaging', unit: 'KG', hsn: '3926', buyPrice: 95, sellPrice: 120, minStock: 50 },
    // Services
    { name: 'Annual Maintenance Contract', category: 'Service', unit: 'NOS', hsn: '9987', buyPrice: 15000, sellPrice: 22000, minStock: 0 },
    { name: 'Calibration Service', category: 'Service', unit: 'NOS', hsn: '9987', buyPrice: 2500, sellPrice: 3500, minStock: 0 },
    { name: 'Job Work – Machining / Hr', category: 'Service', unit: 'NOS', hsn: '9988', buyPrice: 350, sellPrice: 500, minStock: 0 },
]

// Expand to 100 products by repeating & adding suffixes
const products = Array.from({ length: 100 }, (_, i) => {
    const template = PRODUCT_CATALOGUE[i % PRODUCT_CATALOGUE.length]
    const variant = Math.floor(i / PRODUCT_CATALOGUE.length)
    const suffix = variant > 0 ? ` - V${variant + 1}` : ''
    const priceVar = 1 + (variant * 0.05)

    return {
        code: `PROD-${pad(i + 1)}`,
        name: template.name + suffix,
        description: `${template.category} item. HSN: ${template.hsn}. Used in manufacturing operations.`,
        category: template.category,
        unit: template.unit,
        hsn_code: template.hsn,
        gst_percent: pick(GST_RATES),
        purchase_price: Math.round(template.buyPrice * priceVar * 100) / 100,
        sale_price: Math.round((template.sellPrice ?? template.buyPrice * 1.2) * priceVar * 100) / 100,
        min_stock_level: template.minStock ?? 0,
        current_stock: rand(0, template.minStock ? template.minStock * 3 : 50),
        is_active: 1,
    }
})

// ════════════════════════════════════════════════════════════════════════════
// 3. TRANSPORTERS  (50 records)
//    Table  : transport_masters
//    Fields : name, owner_name, mobile, gstin, address, is_active
// ════════════════════════════════════════════════════════════════════════════

const TRANSPORT_NAMES = [
    'Shree Ram Transport', 'Balaji Roadways', 'Jay Ambe Logistics',
    'National Carriers', 'Sai Roadlines', 'Ganesh Transport Co',
    'United Cargo Express', 'Star Movers & Packers', 'Om Sai Logistics',
    'Patel Transport Corp', 'Gujarat Roadways', 'Rajhans Cargo',
    'Mahadev Transport', 'Krishna Logistics', 'Prime Road Carriers',
    'Apex Freight Services', 'Pioneer Logistics', 'Excel Transport',
    'Supreme Roadlines', 'Allied Cargo & Couriers',
]

const transporters = Array.from({ length: 50 }, (_, i) => {
    const num = i + 1
    const baseName = TRANSPORT_NAMES[i % TRANSPORT_NAMES.length]
    const name = i < TRANSPORT_NAMES.length ? baseName : `${baseName} - Zone ${Math.floor(i / TRANSPORT_NAMES.length) + 1}`
    const state = STATES[i % STATES.length]
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[i % LAST_NAMES.length]
    const pan = makePAN(i + 400)

    return {
        name,
        owner_name: `${first} ${last}`,
        mobile: makeMobile(i + 200),
        gstin: makeGSTIN(state, pan),
        address: makeAddress(state),
        is_active: 1,
    }
})

// ════════════════════════════════════════════════════════════════════════════
// 4. WAREHOUSES  (20 records)
//    Table  : warehouses
//    Fields : code, name, address, city, state, manager_name, manager_mobile,
//             is_active
// ════════════════════════════════════════════════════════════════════════════

const WAREHOUSE_TYPES = [
    'Main Store', 'Finished Goods Store', 'Raw Material Store',
    'Dispatch Store', 'Bonded Warehouse', 'Cold Storage',
    'Overflow Annex', 'Transit Hub', 'Regional Distribution Centre',
    'QC Quarantine Store',
]

const warehouses = Array.from({ length: 20 }, (_, i) => {
    const num = i + 1
    const state = STATES[i % STATES.length]
    const city = CITIES[state][i % CITIES[state].length]
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[i % LAST_NAMES.length]

    return {
        code: `WH-${pad(num)}`,
        name: `${city} ${WAREHOUSE_TYPES[i % WAREHOUSE_TYPES.length]}`,
        address: makeAddress(state),
        city,
        state,
        manager_name: `${first} ${last}`,
        manager_mobile: makeMobile(i + 300),
        is_active: 1,
    }
})

// ════════════════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('╔══════════════════════════════════════════╗')
    console.log('║   TechMicra ERP  –  Master Seed Script  ║')
    console.log('╚══════════════════════════════════════════╝')

    await insertBatched('vendors', vendors, 'Vendors')
    await insertBatched('products', products, 'Products')
    await insertBatched('transport_masters', transporters, 'Transporters')
    await insertBatched('warehouses', warehouses, 'Warehouses')

    console.log('\n🎉  All master data seeded successfully!\n')
}

main()
