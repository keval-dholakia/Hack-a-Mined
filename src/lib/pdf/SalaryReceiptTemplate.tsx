import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 }
    ]
})

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Open Sans',
        fontSize: 10,
        color: '#000000'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 20
    },
    boxTop: {
        flexDirection: 'row',
        border: '1px solid #000',
        marginBottom: 15
    },
    colHalfHeader: {
        width: '50%',
        padding: 8,
        borderRight: '1px solid #000'
    },
    colHalfHeaderLast: {
        width: '50%',
        padding: 8
    },
    bold: { fontWeight: 700 },
    mb4: { marginBottom: 4 },

    // Table
    table: {
        border: '1px solid #000',
        marginBottom: 15
    },
    trHead: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderBottom: '1px solid #000'
    },
    thItem: { width: '35%', padding: 6, textAlign: 'center', fontWeight: 700, borderRight: '1px solid #000' },
    thAmt: { width: '15%', padding: 6, textAlign: 'center', fontWeight: 700, borderRight: '1px solid #000' },
    thItemLast: { width: '35%', padding: 6, textAlign: 'center', fontWeight: 700, borderRight: '1px solid #000' },
    thAmtLast: { width: '15%', padding: 6, textAlign: 'center', fontWeight: 700 },

    tr: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #000'
    },
    tdItem: { width: '35%', padding: 6, borderRight: '1px solid #000' },
    tdAmt: { width: '15%', padding: 6, textAlign: 'right', borderRight: '1px solid #000' },
    tdItemLast: { width: '35%', padding: 6, borderRight: '1px solid #000' },
    tdAmtLast: { width: '15%', padding: 6, textAlign: 'right' },

    trTotal: {
        flexDirection: 'row',
    },

    // Footer
    footerBox: {
        border: '1px solid #000',
        padding: 10,
        marginBottom: 50
    },
    signRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    signCol: {
        width: '40%',
        textAlign: 'center'
    }
})

function numberToWords(n: number): string {
    if (n === 0) return "Zero Rupees Only"
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    function convert(num: number): string {
        if (num < 20) return a[num]
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + a[num % 10] : "")
        if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + convert(num % 100) : "")
        if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + convert(num % 1000) : "")
        if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + convert(num % 100000) : "")
        return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + convert(num % 10000000) : "")
    }
    return convert(Math.floor(n)).trim() + " Rupees Only"
}

export function generateSalaryPdfDoc(data: any) {
    const { company, employee, salary, earnings, deductions } = data

    const maxLines = Math.max(earnings.length, deductions.length, 4) // minimum 4 rows
    const rows = []

    for (let i = 0; i < maxLines; i++) {
        rows.push({
            e: earnings[i] || { name: '', amount: null },
            d: deductions[i] || { name: '', amount: null }
        })
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>SALARY SLIP / PAYSLIP</Text>
                <Text style={styles.subtitle}>For the month of {salary.month}, {salary.year}</Text>

                <View style={styles.boxTop}>
                    <View style={styles.colHalfHeader}>
                        <Text style={[styles.bold, styles.mb4]}>{company.name}</Text>
                        <Text style={styles.mb4}>{company.address}</Text>
                        <Text style={styles.mb4}>GSTIN: <Text style={styles.bold}>{company.gstin}</Text></Text>
                        <Text>Email: {company.email}</Text>
                    </View>
                    <View style={styles.colHalfHeaderLast}>
                        {/* intentionally blank or add company logo, etc */}
                    </View>
                </View>

                <View style={[styles.boxTop, { borderTop: 0, marginTop: -15 }]}>
                    <View style={styles.colHalfHeader}>
                        <Text style={styles.mb4}><Text style={styles.bold}>Employee Name: </Text>{employee.name}</Text>
                        <Text style={styles.mb4}><Text style={styles.bold}>Employee ID: </Text>{employee.emp_code}</Text>
                        <Text style={styles.mb4}><Text style={styles.bold}>Designation: </Text>{employee.designation}</Text>
                        <Text><Text style={styles.bold}>Department: </Text>{employee.department}</Text>
                    </View>
                    <View style={styles.colHalfHeaderLast}>
                        <Text style={styles.mb4}><Text style={styles.bold}>Date of Joining: </Text>{employee.joining_date}</Text>
                        <Text style={styles.mb4}><Text style={styles.bold}>Total Working Days: </Text>{salary.total_days}</Text>
                        <Text style={styles.mb4}><Text style={styles.bold}>Days Present: </Text>{salary.present_days}</Text>
                        <Text><Text style={styles.bold}>Bank Account: </Text>{employee.bank_account}</Text>
                    </View>
                </View>

                {/* Earnings & Deductions Table */}
                <View style={styles.table}>
                    <View style={styles.trHead}>
                        <Text style={styles.thItem}>Earnings</Text>
                        <Text style={styles.thAmt}>Amount (Rs.)</Text>
                        <Text style={styles.thItemLast}>Deductions</Text>
                        <Text style={styles.thAmtLast}>Amount (Rs.)</Text>
                    </View>

                    {rows.map((r, i) => (
                        <View key={i} style={styles.tr}>
                            <Text style={styles.tdItem}>{r.e.name}</Text>
                            <Text style={styles.tdAmt}>{r.e.amount !== null ? Number(r.e.amount).toFixed(2) : ''}</Text>
                            <Text style={styles.tdItemLast}>{r.d.name}</Text>
                            <Text style={styles.tdAmtLast}>{r.d.amount !== null ? Number(r.d.amount).toFixed(2) : ''}</Text>
                        </View>
                    ))}

                    <View style={styles.trTotal}>
                        <Text style={[styles.tdItem, styles.bold]}>Total Earnings</Text>
                        <Text style={[styles.tdAmt, styles.bold]}>{Number(salary.gross_salary).toFixed(2)}</Text>
                        <Text style={[styles.tdItemLast, styles.bold]}>Total Deductions</Text>
                        <Text style={[styles.tdAmtLast, styles.bold]}>{Number(salary.total_deductions).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Net Pay & Words */}
                <View style={styles.footerBox}>
                    <Text style={styles.mb4}><Text style={styles.bold}>Net Pay for the month: </Text>Rs. {Number(salary.net_pay).toFixed(2)}</Text>
                    <Text><Text style={styles.bold}>Amount in Words: </Text>{numberToWords(Number(salary.net_pay))}</Text>
                </View>

                {/* Signatures */}
                <View style={styles.signRow}>
                    <View style={styles.signCol}>
                        <Text style={styles.mb4}>________________________</Text>
                        <Text>Employer Signature</Text>
                    </View>
                    <View style={styles.signCol}>
                        <Text style={styles.mb4}>________________________</Text>
                        <Text>Employee Signature</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
