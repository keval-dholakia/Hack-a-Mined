export type ToolFormData = {
    tool_code: string;
    tool_name: string;
    category: string;
    make: string | null;
    model: string | null;
    serial_number: string | null;
    location: string | null;
    purchase_date: string | null;
    purchase_cost: number | null;
    condition: string;
    remarks: string | null;
};

export type Tool = ToolFormData & {
    id: number;
    is_active: number;
    created_at: string;
    updated_at: string;
};

export type CalibrationFormData = {
    tool_id: number;
    calibration_date: string;
    next_due_date: string;
    done_by: string;
    result: string;
    certificate_number: string | null;
    remarks: string | null;
};

export type CalibrationRecord = CalibrationFormData & {
    id: number;
    tool_code: string;
    tool_name: string;
    created_at: string;
};

export type RectificationFormData = {
    tool_id: number;
    issue_date: string;
    issue_desc: string;
    action_taken: string | null;
    resolved_date: string | null;
    cost: number | null;
    status: string;
    remarks: string | null;
};

export type RectificationMemo = RectificationFormData & {
    id: number;
    memo_number: string;
    tool_code: string;
    tool_name: string;
    created_at: string;
    updated_at: string;
};
