// ─────────────────────────────────────────────────────────────────────────────
// Seed Script – 100 Indian Customers
// Run with:  node scripts/seed-customers.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ogolwsyvogwknidsxzgk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_8FG-qXp0yonvLrgA1rqGiQ_rPmzRInG'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Static lookup tables ────────────────────────────────────────────────────

const STATES = [
    'Gujarat', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Tamil Nadu',
    'Uttar Pradesh', 'Delhi', 'West Bengal', 'Punjab', 'Haryana',
    'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Bihar',
]

const CITIES_BY_STATE = {
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Lajpat Nagar', 'Karol Bagh'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kakinada'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
}

const COMPANY_TYPES = ['Pvt Ltd', 'Enterprises', 'Industries', 'Trading Co', 'Solutions', 'Traders', 'Corporation', 'Suppliers']
const COMPANY_PREFIXES = [
    'Shree', 'Sai', 'Balaji', 'Ganesh', 'Jay', 'Mahadev', 'Laxmi', 'Krishna',
    'Om', 'Surya', 'Patel', 'Mehta', 'Shah', 'Gupta', 'Sharma', 'Singh',
    'Joshi', 'Kapoor', 'Agarwal', 'Verma', 'Malhotra', 'Tata', 'Birla',
    'Reliance', 'Future', 'National', 'Global', 'Prime', 'Apex', 'Star',
]
const CONTACT_FIRST = [
    'Raj', 'Amit', 'Priya', 'Sunita', 'Vikram', 'Neha', 'Ravi', 'Kavita',
    'Suresh', 'Anjali', 'Deepak', 'Pooja', 'Anil', 'Rekha', 'Sanjay',
    'Meena', 'Rahul', 'Divya', 'Ajay', 'Shweta',
]
const CONTACT_LAST = [
    'Patel', 'Shah', 'Mehta', 'Sharma', 'Gupta', 'Singh', 'Verma', 'Joshi',
    'Nair', 'Pillai', 'Reddy', 'Rao', 'Iyer', 'Pandey', 'Mishra',
]

// ── Helpers ─────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

/** Deterministic-ish GSTIN: <state-code><PAN>1ZV  (valid format, fake data) */
function makeGSTIN(stateCode, pan) {
    return `${String(stateCode).padStart(2, '0')}${pan}1ZV`
}

/** Fake but format-correct PAN: ABCDE1234F */
function makePAN(index) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const alpha = (n) => letters[n % 26]
    return `${alpha(index)}${alpha(index + 3)}${alpha(index + 7)}${alpha(index + 11)}${alpha(index + 15)}${rand(1000, 9999)}${alpha(index + 2)}`
}

/** Map state name → GST state code */
const STATE_CODE = {
    'Jammu & Kashmir': 1, 'Himachal Pradesh': 2, 'Punjab': 3,
    'Chandigarh': 4, 'Uttarakhand': 5, 'Haryana': 6, 'Delhi': 7,
    'Rajasthan': 8, 'Uttar Pradesh': 9, 'Bihar': 10, 'Sikkim': 11,
    'Arunachal Pradesh': 12, 'Nagaland': 13, 'Manipur': 14, 'Mizoram': 15,
    'Tripura': 16, 'Meghalaya': 17, 'Assam': 18, 'West Bengal': 19,
    'Jharkhand': 20, 'Odisha': 21, 'Chhattisgarh': 22, 'Madhya Pradesh': 23,
    'Gujarat': 24, 'Dadra & Nagar Haveli': 26, 'Maharashtra': 27, 'Andhra Pradesh': 28,
    'Karnataka': 29, 'Goa': 30, 'Lakshadweep': 31, 'Kerala': 32,
    'Tamil Nadu': 33, 'Puducherry': 34, 'Andaman & Nicobar': 35, 'Telangana': 36,
    'Andhra Pradesh (new)': 37, 'Ladakh': 38,
}

function makePincode(state) {
    const PIN_RANGE = {
        'Gujarat': [380001, 396460], 'Maharashtra': [400001, 445402],
        'Rajasthan': [301001, 345034], 'Karnataka': [560001, 591346],
        'Tamil Nadu': [600001, 643253], 'Uttar Pradesh': [201001, 285205],
        'Delhi': [110001, 110096], 'West Bengal': [700001, 743700],
        'Punjab': [140001, 152128], 'Haryana': [121001, 136136],
        'Madhya Pradesh': [450001, 488448], 'Andhra Pradesh': [500001, 535591],
        'Telangana': [500001, 509412], 'Kerala': [670001, 695615],
        'Bihar': [800001, 855117],
    }
    const [min, max] = PIN_RANGE[state] ?? [110001, 110096]
    return String(rand(min, max))
}

// ── Build 100 customer records ───────────────────────────────────────────────

const customers = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1
    const code = `CUST-${String(num).padStart(3, '0')}`
    const state = STATES[i % STATES.length]
    const city = CITIES_BY_STATE[state][i % CITIES_BY_STATE[state].length]
    const prefix = COMPANY_PREFIXES[i % COMPANY_PREFIXES.length]
    const type = COMPANY_TYPES[i % COMPANY_TYPES.length]
    const name = `${prefix} ${type}`
    const contactFirst = CONTACT_FIRST[i % CONTACT_FIRST.length]
    const contactLast = CONTACT_LAST[i % CONTACT_LAST.length]
    const contactPerson = `${contactFirst} ${contactLast}`
    const mobile = `${pick(['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '84', '83'])}${String(rand(10000000, 99999999))}`
    const email = `${contactFirst.toLowerCase()}.${contactLast.toLowerCase()}${num}@${prefix.toLowerCase()}${type.toLowerCase().replace(/\s/g, '')}.com`
    const pan = makePAN(i)
    const stateCode = STATE_CODE[state] ?? 24
    const gstin = makeGSTIN(stateCode, pan)
    const pincode = makePincode(state)
    const streetNum = rand(1, 500)
    const billing = `${streetNum}, ${pick(['MG Road', 'Ring Road', 'Industrial Area', 'Market Street', 'Station Road', 'Gandhi Nagar', 'Nehru Colony'])}, ${city}`
    const shipping = billing
    const creditPeriod = pick([15, 30, 45, 60, 90])
    const creditLimit = pick([50000, 100000, 200000, 300000, 500000, 1000000])

    return {
        code,
        name,
        gstin,
        pan,
        contact_person: contactPerson,
        mobile,
        email,
        billing_address: billing,
        shipping_address: shipping,
        city,
        state,
        pincode,
        place_of_supply: state,
        credit_period: creditPeriod,
        credit_limit: creditLimit,
        is_active: 1,
    }
})

// ── Insert into Supabase ────────────────────────────────────────────────────

async function seed() {
    console.log('🌱  Seeding 100 customers into Supabase...\n')

    // Insert in batches of 25 to respect payload limits
    const BATCH = 25
    for (let i = 0; i < customers.length; i += BATCH) {
        const batch = customers.slice(i, i + BATCH)
        const { error } = await supabase.from('customers').insert(batch)
        if (error) {
            console.error(`❌  Batch ${i / BATCH + 1} failed:`, error.message)
        } else {
            console.log(`✅  Batch ${i / BATCH + 1} inserted (${batch.length} records)`)
        }
    }

    console.log('\n🎉  Seeding complete!')
}

seed()
