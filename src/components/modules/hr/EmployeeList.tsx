'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee, updateEmployee, toggleEmployeeStatus } from '@/app/actions/hr'
import type { Employee } from '@/types/hr'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'

type Props = { employees: Employee[] }

const DEPARTMENTS = [
    'Production', 'Quality', 'Purchase', 'Sales', 'Finance',
    'HR', 'Stores', 'Maintenance', 'Admin', 'IT', 'Logistics',
]

export default function EmployeeList({ employees }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [dept, setDept] = useState('')
    const [showNew, setShowNew] = useState(false)

    const filtered = employees.filter(e => {
        const matchSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.emp_code?.toLowerCase().includes(search.toLowerCase()) ||
            e.mobile?.includes(search) ||
            e.designation?.toLowerCase().includes(search.toLowerCase())
        const matchDept = dept ? e.department === dept : true
        return matchSearch && matchDept
    })

    const depts = [...new Set(employees.map(e => e.department).filter(Boolean))]

    async function handleToggle(id: number, is_active: number) {
        await toggleEmployeeStatus(id, is_active)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Employees</h1>
                    <p className={styles.subtitle}>{employees.length} total employees</p>
                </div>
                <div className={styles.headerRight} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Employee Register',
                        subtitle: `${filtered.length} employees`,
                        columns: [
                            { header: 'Code', dataKey: 'emp_code' },
                            { header: 'Name', dataKey: 'name' },
                            { header: 'Department', dataKey: 'department' },
                            { header: 'Designation', dataKey: 'designation' },
                            { header: 'Mobile', dataKey: 'mobile' },
                            { header: 'Basic Salary', dataKey: 'basic_salary', format: 'currency', align: 'right' },
                            { header: 'Status', dataKey: 'is_active' },
                        ],
                        rows: filtered.map(e => ({
                            ...e,
                            is_active: e.is_active === 1 ? 'Active' : 'Inactive',
                            basic_salary: Number(e.basic_salary) || 0
                        })),
                        fileName: 'Employee_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/hr/employees/analytics')}
                        style={{ color: '#22d3ee' }}>
                        ◎ Analytics
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/hr/employees/new')}>
                        + New Employee
                    </Button>
                </div>
            </div>

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Search by name, code, mobile or designation..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className={styles.filterSelect} value={dept} onChange={e => setDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {depts.map(d => <option key={d!} value={d!}>{d}</option>)}
                </select>
            </div>

            <Card noPad>
                <Table
                    columns={[
                        { key: 'emp_code', label: 'Code' },
                        { key: 'name', label: 'Name' },
                        { key: 'designation', label: 'Designation' },
                        {
                            key: 'department', label: 'Department',
                            render: v => v ? <span className={styles.deptBadge}>{v as string}</span> : '—'
                        },
                        { key: 'mobile', label: 'Mobile' },
                        {
                            key: 'basic_salary', label: 'Basic Salary', align: 'r',
                            render: v => `₹${Number(v).toLocaleString('en-IN')}`
                        },
                        { key: 'joining_date', label: 'Joined', render: v => v ? new Date(v as string).toLocaleDateString('en-IN') : '—' },
                        {
                            key: 'is_active', label: 'Status', align: 'c',
                            render: v => <Badge label={v === 1 ? 'Active' : 'Inactive'} variant={v === 1 ? 'success' : 'default'} />
                        },
                        {
                            key: 'id', label: 'Actions', align: 'c',
                            render: (v, row) => (
                                <div className={styles.actions}>
                                    <button className={styles.editBtn} onClick={() => router.push(`/dashboard/hr/employees/${v}`)}>Edit</button>
                                    <button className={styles.editBtn} style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.15)' }}
                                        onClick={() => router.push(`/dashboard/hr/salary-sheet/new?emp=${v}`)}>Salary</button>
                                    <button className={styles.toggleBtn} onClick={() => handleToggle(v as number, row.is_active as number)}>
                                        {row.is_active === 1 ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            )
                        },
                    ]}
                    rows={filtered}
                />
            </Card>
        </div>
    )
}
