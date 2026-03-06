'use client';

import { useState, FormEvent, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Tabs from '@/components/ui/Tabs';
import {
    EMPLOYEES, SALARY_HEADS, STRUCTURES, SALARY_SHEET, ADVANCES, SalaryHead
} from '@/lib/hrData';
import styles from './HR.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const fmtC = (v: number) => `₹${Number(v).toLocaleString('en-IN')}`;
const fmtL = (v: number) => `₹${(v / 100000).toFixed(2)}L`;

const HR_TABS = ['Dashboard', 'Employees', 'Salary Heads', 'Salary Structure', 'Salary Sheet', 'Advances'];

// ─── Dashboard Tab ────────────────────────────────────────
function HRDashboard() {
    const DEPTS = [
        { name: 'Production', count: 12, color: 'var(--accent)' },
        { name: 'Sales', count: 6, color: 'var(--green)' },
        { name: 'Quality', count: 4, color: 'var(--amber)' },
        { name: 'Finance', count: 3, color: 'var(--red)' },
        { name: 'HR', count: 2, color: 'var(--text-muted)' },
        { name: 'Stores', count: 3, color: 'var(--accent)' },
    ];
    const MAX = 12;
    const ACTIVITY = [
        { color: 'var(--green)', text: 'Salary sheet generated — June 2024', time: '2h ago' },
        { color: 'var(--accent)', text: 'Advance memo ADV-2024-012 approved', time: '1d ago' },
        { color: 'var(--amber)', text: 'Priya Shah — 2 days absent in June', time: '2d ago' },
        { color: 'var(--green)', text: 'Kavita Patel joined — HR Executive', time: '4d ago' },
    ];
    return (
        <>
            <div className={styles.grid4}>
                <StatCard label="Total Headcount" value="30" sub="active employees" />
                <StatCard label="Monthly Payroll" value="₹9.2L" sub="gross" trend={1.8} />
                <StatCard label="Pending Advances" value="₹23K" sub="to be recovered" />
                <StatCard label="Avg. CTC" value="₹4.8L" sub="per annum" />
            </div>
            <div className={styles.grid2}>
                <Card title="Headcount by Department">
                    {DEPTS.map(d => (
                        <div key={d.name} className={styles.hbarWrap}>
                            <div className={styles.hbarLabel}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.name}</span>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{d.count}</span>
                            </div>
                            <div className={styles.hbarTrack}>
                                <div className={styles.hbarFill} style={{ width: `${(d.count / MAX) * 100}%`, background: d.color }} />
                            </div>
                        </div>
                    ))}
                </Card>
                <Card title="Recent Activity">
                    {ACTIVITY.map((a, i) => (
                        <div key={i} className={styles.activityRow}>
                            <span style={{ color: a.color, fontSize: 10, marginTop: 3 }}>●</span>
                            <div>
                                <div style={{ fontSize: 12.5 }}>{a.text}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </>
    );
}

// ─── Employees Tab ────────────────────────────────────────
function HREmployees() {
    const [employees, setEmployees] = useState(EMPLOYEES);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: '', name: '', designation: '', dept: '',
        mobile: '', joining: '', basic: '', bank: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulating API call
        try {
            // Here you would do: await fetch('/api/employees', { method: 'POST', body: JSON.stringify(formData) })
            await new Promise(resolve => setTimeout(resolve, 600)); // fake delay

            const newEmp = {
                ...formData,
                basic: Number(formData.basic),
                status: 'Active'
            };

            setEmployees(prev => [...prev, newEmp]);
            setShowModal(false);
            setFormData({ code: '', name: '', designation: '', dept: '', mobile: '', joining: '', basic: '', bank: '' });
        } catch (error) {
            console.error("Failed to add employee:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <span>Add New Employee</span>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Emp Code *</label>
                                        <input required name="code" value={formData.code} onChange={handleChange} pattern="^[A-Z0-9-]+$" title="Requires uppercase letters, numbers, and hyphens (e.g. EMP-007)" placeholder="e.g. EMP-007" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Name *</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} pattern="^[a-zA-Z\s.-]+$" title="Only characters space dot or hyphen are allowed" placeholder="Full Name" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Designation *</label>
                                        <input required name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Developer" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Department</label>
                                        <input name="dept" value={formData.dept} onChange={handleChange} placeholder="e.g. IT" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Mobile *</label>
                                        <input required type="tel" name="mobile" value={formData.mobile} onChange={handleChange} pattern="^(?:\d{5}-\d{5}|\d{10})$" title="Must be 10 digits or 5-5 digits (e.g. 98765-43210)" placeholder="e.g. 98765-43210" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Joining Date *</label>
                                        <input required type="date" name="joining" value={formData.joining} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Basic Salary *</label>
                                        <input required type="number" min="0" step="0.01" name="basic" value={formData.basic} onChange={handleChange} placeholder="e.g. 50000" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Bank Details *</label>
                                        <input required name="bank" value={formData.bank} onChange={handleChange} placeholder="e.g. HDFC 4521" />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Employee'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.grid4}>
                <StatCard label="Total Employees" value={employees.length.toString()} sub="active" />
                <StatCard label="Total Payroll" value="₹3.06L" sub="this month" trend={2.1} />
                <StatCard label="New Joiners" value="1" sub="this month" />
                <StatCard label="Avg. Basic" value="₹32.5K" sub="per employee" />
            </div>
            <Card title="Employee Master" noPad action={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Add Employee</Button>}>
                <Table
                    columns={[
                        { key: 'code', label: 'Emp Code', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                        { key: 'name', label: 'Name', render: (v, row) => <div><div style={{ fontWeight: 500 }}>{v as string}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(row as { dept: string }).dept}</div></div> },
                        { key: 'designation', label: 'Designation' },
                        { key: 'mobile', label: 'Mobile' },
                        { key: 'joining', label: 'Joining Date' },
                        { key: 'basic', label: 'Basic Salary', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{fmtC(v as number)}</span> },
                        { key: 'status', label: 'Status', align: 'c', render: () => <Badge label="Active" variant="success" /> },
                    ]}
                    rows={employees}
                />
            </Card>
        </>
    );
}

// ─── Salary Heads Tab ─────────────────────────────────────
function HRSalaryHeads() {
    const [heads, setHeads] = useState<SalaryHead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeads = async () => {
            try {
                // Simulating an API call to fetch the static static salary template plan
                await new Promise(resolve => setTimeout(resolve, 800));
                setHeads(SALARY_HEADS);
            } catch (error) {
                console.error("Failed to fetch salary components:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHeads();
    }, []);

    return (
        <Card title="Salary Component Template" noPad>
            {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading salary components from backend...
                </div>
            ) : (
                <Table
                    columns={[
                        { key: 'head', label: 'Head Name', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                        { key: 'type', label: 'Type', render: v => <Badge label={v as string} variant={(v === 'Earning' ? 'success' : 'danger') as BadgeVariant} /> },
                        { key: 'calcOn', label: 'Calculation Basis' },
                        { key: 'value', label: 'Value / Rate', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                    ]}
                    rows={heads}
                />
            )}
        </Card>
    );
}

// ─── Salary Structure Tab ─────────────────────────────────
function HRStructure() {
    const [structures, setStructures] = useState(STRUCTURES);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Basic calculation rates matching Salary Master
    const HRA_RATE = 0.40;
    const DA_RATE = 0.12;
    const PF_RATE = 0.12;
    const ESIC_RATE = 0.0075;
    const PT_VALUE = 200;
    const CONV_VALUE = 1600;

    const [formData, setFormData] = useState({
        empCode: '', effDate: '', basic: ''
    });

    const [calculated, setCalculated] = useState({
        name: '', hra: 0, da: 0, pf: 0, esic: 0,
        gross: 0, net: 0,
    });

    // Auto-calculate fields when basic changes
    useEffect(() => {
        const basicAmt = Number(formData.basic) || 0;
        const hra = basicAmt * HRA_RATE;
        const da = basicAmt * DA_RATE;
        const pf = basicAmt * PF_RATE;
        const gross = basicAmt + hra + da + CONV_VALUE;
        const esic = gross * ESIC_RATE;
        const net = gross - pf - esic - PT_VALUE;

        let empName = '';
        if (formData.empCode) {
            const foundEmp = EMPLOYEES.find(e => e.code.toLowerCase() === formData.empCode.toLowerCase());
            if (foundEmp) empName = foundEmp.name;
        }

        setCalculated({
            name: empName,
            hra, da, pf, esic, gross, net
        });
    }, [formData.basic, formData.empCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulating API

            const newStruct = {
                emp: calculated.name || formData.empCode,
                effDate: formData.effDate,
                basic: Number(formData.basic),
                hra: calculated.hra,
                da: calculated.da,
                conv: CONV_VALUE,
                pf: calculated.pf,
                esic: calculated.esic,
                pt: PT_VALUE,
                gross: calculated.gross,
                net: calculated.net
            };

            setStructures(prev => {
                const existingIndex = prev.findIndex(s => s.emp.toLowerCase() === newStruct.emp.toLowerCase());
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = newStruct;
                    return updated;
                }
                return [...prev, newStruct];
            });
            setShowModal(false);
            setFormData({ empCode: '', effDate: '', basic: '' });
        } catch (error) {
            console.error("Failed to assign pay structure:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <span>Assign Pay Structure</span>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Emp Code *</label>
                                        <input required name="empCode" value={formData.empCode} onChange={handleChange} placeholder="e.g. EMP-001" />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Employee Name</label>
                                        <input disabled value={calculated.name || 'Not found'} style={{ background: 'var(--bg-active)' }} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Effective Date *</label>
                                        <input required type="date" name="effDate" value={formData.effDate} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Basic Salary *</label>
                                        <input required type="number" min="0" step="0.01" name="basic" value={formData.basic} onChange={handleChange} placeholder="e.g. 45000" />
                                    </div>

                                    {/* Auto-calculated preview fields */}
                                    <div className={styles.formField}>
                                        <label>HRA (40%)</label>
                                        <input disabled value={fmtC(calculated.hra)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>DA (12%)</label>
                                        <input disabled value={fmtC(calculated.da)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>PF (12%)</label>
                                        <input disabled value={fmtC(calculated.pf)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Gross Salary</label>
                                        <input disabled value={fmtC(calculated.gross)} style={{ fontWeight: 600 }} />
                                    </div>
                                    <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                                        <label>Net Pay</label>
                                        <input disabled value={fmtC(calculated.net)} style={{ fontWeight: 700, color: 'var(--accent)' }} />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting || !calculated.name}>
                                    {isSubmitting ? 'Saving...' : 'Assign Pay'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Card title="Employee Salary Structures" noPad action={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Assign Structure</Button>}>
                <Table
                    columns={[
                        { key: 'emp', label: 'Employee', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                        { key: 'effDate', label: 'Effective From' },
                        { key: 'basic', label: 'Basic', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{fmtC(v as number)}</span> },
                        { key: 'hra', label: 'HRA', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{fmtC(v as number)}</span> },
                        { key: 'da', label: 'DA', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{fmtC(v as number)}</span> },
                        { key: 'pf', label: 'PF', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>{fmtC(v as number)}</span> },
                        { key: 'gross', label: 'Gross', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(v as number)}</span> },
                        { key: 'net', label: 'Net Pay', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>{fmtC(v as number)}</span> },
                    ]}
                    rows={structures as unknown as Record<string, unknown>[]}
                />
            </Card>
        </>
    );
}

// ─── Salary Sheet Tab ─────────────────────────────────────
function HRSalarySheet() {
    const tGross = SALARY_SHEET.reduce((s, r) => s + r.gross, 0);
    const tNet = SALARY_SHEET.reduce((s, r) => s + r.net, 0);
    const tPF = SALARY_SHEET.reduce((s, r) => s + r.pf, 0);
    const tTDS = SALARY_SHEET.reduce((s, r) => s + r.tds, 0);
    const tESIC = SALARY_SHEET.reduce((s, r) => s + r.esic, 0);
    const tPT = SALARY_SHEET.reduce((s, r) => s + r.pt, 0);
    const tDed = SALARY_SHEET.reduce((s, r) => s + r.pf + r.esic + r.pt + r.tds, 0);

    return (
        <>
            <div className={styles.grid4}>
                <StatCard label="Gross Payroll" value={fmtL(tGross)} sub={`${SALARY_SHEET.length} employees`} />
                <StatCard label="Net Payroll" value={fmtL(tNet)} sub="after all deductions" trend={1.2} />
                <StatCard label="PF Liability" value={fmtC(tPF)} sub="employer + employee" />
                <StatCard label="TDS Payable" value={fmtC(tTDS)} sub="this month" />
            </div>
            <Card title="Salary Sheet — June 2024" noPad
                action={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="secondary" size="sm">⬇ Export Excel</Button>
                        <Button variant="primary" size="sm">Generate Sheet</Button>
                    </div>
                }
            >
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.tbl}>
                        <thead>
                            <tr>
                                {['Emp', 'Name', 'Days', 'Present', 'Gross', 'PF', 'ESIC', 'PT', 'TDS', 'Deductions', 'Net Pay'].map(h => (
                                    <th key={h} className={['Days', 'Present', 'Gross', 'PF', 'ESIC', 'PT', 'TDS', 'Deductions', 'Net Pay'].includes(h) ? styles.r : ''}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SALARY_SHEET.map(r => {
                                const ded = r.pf + r.esic + r.pt + r.tds;
                                return (
                                    <tr key={r.emp}>
                                        <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>{r.emp}</td>
                                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)' }}>{r.total}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', color: r.present < r.total ? 'var(--amber)' : 'inherit' }}>{r.present}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)' }}>{fmtC(r.gross)}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>{fmtC(r.pf)}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>{fmtC(r.esic)}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>{fmtC(r.pt)}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>{fmtC(r.tds)}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: 'var(--red)' }}>{fmtC(ded)}</td>
                                        <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>{fmtC(r.net)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} style={{ fontWeight: 600, color: 'var(--text-muted)', padding: '10px 14px' }}>TOTALS</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmtC(tGross)}</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--red)' }}>{fmtC(tPF)}</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--red)' }}>{fmtC(tESIC)}</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--red)' }}>{fmtC(tPT)}</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--red)' }}>{fmtC(tTDS)}</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--red)' }}>{fmtC(tDed)}</td>
                                <td className={styles.r} style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>{fmtC(tNet)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </>
    );
}

// ─── Advances Tab ─────────────────────────────────────────
function HRAdvances() {
    const pend = ADVANCES.filter(a => a.status === 'Pending').reduce((s, a) => s + a.amount, 0);
    const recov = ADVANCES.filter(a => a.status === 'Recovered').reduce((s, a) => s + a.amount, 0);
    const total = ADVANCES.reduce((s, a) => s + a.amount, 0);
    return (
        <>
            <div className={styles.grid3}>
                <StatCard label="Total Issued" value={fmtC(total)} sub="all advances" />
                <StatCard label="Pending Recovery" value={fmtC(pend)} sub="outstanding balance" />
                <StatCard label="Recovered" value={fmtC(recov)} sub="fully settled" />
            </div>
            <Card title="Advance Memos" noPad action={<Button variant="primary" size="sm">+ New Advance</Button>}>
                <Table
                    columns={[
                        { key: 'id', label: 'Memo No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                        { key: 'emp', label: 'Employee', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                        { key: 'date', label: 'Date' },
                        { key: 'amount', label: 'Amount', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(v as number)}</span> },
                        { key: 'purpose', label: 'Purpose' },
                        { key: 'recovery', label: 'Recovery Month' },
                        { key: 'status', label: 'Status', align: 'c', render: v => <Badge label={v as string} variant={(v === 'Recovered' ? 'success' : 'warning') as BadgeVariant} /> },
                    ]}
                    rows={ADVANCES as unknown as Record<string, unknown>[]}
                />
            </Card>
        </>
    );
}

// ─── Main Component ───────────────────────────────────────
export default function HR() {
    const [activeTab, setActiveTab] = useState('Dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard': return <HRDashboard />;
            case 'Employees': return <HREmployees />;
            case 'Salary Heads': return <HRSalaryHeads />;
            case 'Salary Structure': return <HRStructure />;
            case 'Salary Sheet': return <HRSalarySheet />;
            case 'Advances': return <HRAdvances />;
            default: return null;
        }
    };

    return (
        <>
            <PageHeader
                title="HR Management"
                description="Employee records, salary structures, payroll & advances"
                actions={<Button variant="secondary" icon="⬇">Export</Button>}
            />
            <Tabs tabs={HR_TABS} active={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </>
    );
}
