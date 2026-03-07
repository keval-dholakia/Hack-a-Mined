"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createIQCEntry,
  updateIQCEntry,
  getGRNItems,
} from "@/app/actions/quality";
import type {
  IQCEntry,
  IQCFormData,
  GRNSelectOption,
  GRNItem,
} from "@/types/quality";
import styles from "./Quality.module.scss";

type Props = {
  entry?: IQCEntry;
  grns: GRNSelectOption[];
  products: { id: number; code: string; name: string }[];
  users: { id: number; name: string }[];
  currentUserId: number;
};

const RESULTS = ["Pass", "Fail", "Rework"] as const;

function formatDate(iso: string) {
  return iso?.split("T")[0] ?? "";
}

export default function IQCForm({
  entry,
  grns,
  products,
  users,
  currentUserId,
}: Props) {
  const router = useRouter();
  const isEdit = Boolean(entry);

  const [form, setForm] = useState<IQCFormData>({
    grn_id: entry?.grn_id ?? 0,
    product_id: entry?.product_id ?? 0,
    total_qty: entry?.total_qty ?? 0,
    sample_size: entry?.sample_size ?? 0,
    accepted_qty: entry?.accepted_qty ?? 0,
    rejected_qty: entry?.rejected_qty ?? 0,
    visual_check: entry?.visual_check ?? false,
    dimension_check: entry?.dimension_check ?? false,
    result: entry?.result ?? "Pass",
    checked_by: entry?.checked_by ?? currentUserId,
  });

  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingItems, setLoading] = useState(false);

  // Auto-calculate result from accepted/rejected
  useEffect(() => {
    if (form.sample_size > 0) {
      const rejRate = form.rejected_qty / form.sample_size;
      if (rejRate === 0 && form.visual_check && form.dimension_check) {
        setForm((f) => ({ ...f, result: "Pass" }));
      } else if (
        rejRate > 0.1 ||
        (!form.visual_check && !form.dimension_check)
      ) {
        setForm((f) => ({ ...f, result: "Fail" }));
      } else if (rejRate > 0) {
        setForm((f) => ({ ...f, result: "Rework" }));
      }
    }
  }, [
    form.accepted_qty,
    form.rejected_qty,
    form.visual_check,
    form.dimension_check,
    form.sample_size,
  ]);

  // Load GRN items when GRN changes
  async function handleGRNChange(grnId: number) {
    setForm((f) => ({
      ...f,
      grn_id: grnId,
      product_id: 0,
      total_qty: 0,
      sample_size: 0,
      accepted_qty: 0,
      rejected_qty: 0,
    }));
    if (!grnId) {
      setGrnItems([]);
      return;
    }
    setLoading(true);
    const items = await getGRNItems(grnId);
    setGrnItems(items);
    setLoading(false);
  }

  // When a product from GRN is selected, auto-fill total_qty
  function handleGRNItemSelect(productId: number) {
    const item = grnItems.find((i) => i.product_id === productId);
    setForm((f) => ({
      ...f,
      product_id: productId,
      total_qty: item?.received_qty ?? 0,
      sample_size: Math.max(1, Math.ceil((item?.received_qty ?? 0) * 0.1)), // default 10% sample
    }));
  }

  function set(key: keyof IQCFormData, val: any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.grn_id || !form.product_id) {
      setError("Please select a GRN and a product.");
      return;
    }
    setSaving(true);
    setError(null);

    const result = isEdit
      ? await updateIQCEntry(entry!.id, form)
      : await createIQCEntry(form);

    setSaving(false);
    if ("error" in result) {
      setError(result.error || "An error occurred");
      return;
    }
    router.push("/dashboard/quality/iqc");
    router.refresh();
  }

  const selectedGRN = grns.find((g) => g.id === form.grn_id);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? "Edit IQC Entry" : "New IQC Entry"}
          </h1>
          <p className={styles.subtitle}>
            Complete inspection details for incoming goods
          </p>
        </div>
        <button
          className={styles.ghostBtn}
          onClick={() => router.push("/dashboard/quality/iqc")}
        >
          ← Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* ── Section 1: GRN Reference ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>GRN Reference</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>
                Select GRN <span className={styles.req}>*</span>
              </label>
              <select
                value={form.grn_id}
                onChange={(e) => handleGRNChange(Number(e.target.value))}
                required
              >
                <option value={0} disabled>
                  — select GRN —
                </option>
                {grns.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.grn_no} — {g.vendor_name} (
                    {formatDate(g.gate_entry_date)})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>
                Product <span className={styles.req}>*</span>
              </label>
              {grnItems.length > 0 ? (
                // If GRN has items in DB, show them
                <select
                  value={form.product_id}
                  onChange={(e) => handleGRNItemSelect(Number(e.target.value))}
                  disabled={!form.grn_id || loadingItems}
                  required
                >
                  <option value={0} disabled>
                    {loadingItems ? "Loading…" : "— select product —"}
                  </option>
                  {grnItems.map((i) => (
                    <option key={i.product_id} value={i.product_id}>
                      {i.product_code} — {i.product_name} (received:{" "}
                      {i.received_qty})
                    </option>
                  ))}
                </select>
              ) : (
                // Fallback: all active products
                <select
                  value={form.product_id}
                  onChange={(e) => set("product_id", Number(e.target.value))}
                  disabled={!form.grn_id}
                  required
                >
                  <option value={0} disabled>
                    {loadingItems ? "Loading…" : "— select product —"}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedGRN && (
              <div className={styles.field}>
                <label>Vendor</label>
                <input
                  value={selectedGRN.vendor_name}
                  disabled
                  className={styles.readOnly}
                />
              </div>
            )}

            <div className={styles.field}>
              <label>Checked By</label>
              <select
                value={form.checked_by ?? ""}
                onChange={(e) => set("checked_by", Number(e.target.value))}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 2: Quantity Details ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Quantity Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>
                Total Received Qty <span className={styles.req}>*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.total_qty || ""}
                onChange={(e) => set("total_qty", Number(e.target.value))}
                placeholder="e.g. 100"
                required
              />
            </div>

            <div className={styles.field}>
              <label>
                Sample Size <span className={styles.req}>*</span>
              </label>
              <input
                type="number"
                min={1}
                max={form.total_qty}
                value={form.sample_size || ""}
                onChange={(e) => set("sample_size", Number(e.target.value))}
                placeholder="e.g. 10"
                required
              />
              {form.total_qty > 0 && (
                <span className={styles.fieldHint}>
                  {form.sample_size > 0
                    ? `${((form.sample_size / form.total_qty) * 100).toFixed(0)}% sample`
                    : ""}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label>
                Accepted Qty <span className={styles.req}>*</span>
              </label>
              <input
                type="number"
                min={0}
                max={form.sample_size}
                value={form.accepted_qty || ""}
                onChange={(e) => {
                  const acc = Number(e.target.value);
                  set("accepted_qty", acc);
                  set("rejected_qty", Math.max(0, form.sample_size - acc));
                }}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Rejected Qty</label>
              <input
                type="number"
                min={0}
                value={form.rejected_qty}
                onChange={(e) => set("rejected_qty", Number(e.target.value))}
                className={form.rejected_qty > 0 ? styles.inputDanger : ""}
              />
              {form.rejected_qty > 0 && form.sample_size > 0 && (
                <span className={styles.fieldHintDanger}>
                  {((form.rejected_qty / form.sample_size) * 100).toFixed(1)}%
                  rejection rate
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Quality Checks ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Quality Checks</h2>
          <div className={styles.checkGrid}>
            <label className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={form.visual_check}
                onChange={(e) => set("visual_check", e.target.checked)}
              />
              <div
                className={`${styles.checkContent} ${form.visual_check ? styles.checkedCard : ""}`}
              >
                <span className={styles.checkIcon}>👁</span>
                <div>
                  <p className={styles.checkLabel}>Visual Check</p>
                  <p className={styles.checkDesc}>
                    Surface defects, colour, finish, labelling
                  </p>
                </div>
                <span
                  className={`${styles.checkStatus} ${form.visual_check ? styles.checkStatusPass : styles.checkStatusFail}`}
                >
                  {form.visual_check ? "✓ OK" : "✗ Not OK"}
                </span>
              </div>
            </label>

            <label className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={form.dimension_check}
                onChange={(e) => set("dimension_check", e.target.checked)}
              />
              <div
                className={`${styles.checkContent} ${form.dimension_check ? styles.checkedCard : ""}`}
              >
                <span className={styles.checkIcon}>📐</span>
                <div>
                  <p className={styles.checkLabel}>Dimension Check</p>
                  <p className={styles.checkDesc}>
                    Size, weight, tolerance within spec
                  </p>
                </div>
                <span
                  className={`${styles.checkStatus} ${form.dimension_check ? styles.checkStatusPass : styles.checkStatusFail}`}
                >
                  {form.dimension_check ? "✓ OK" : "✗ Not OK"}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* ── Section 4: Result ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Inspection Result</h2>

          <div className={styles.resultGrid}>
            {RESULTS.map((r) => (
              <label
                key={r}
                className={`${styles.resultCard} ${form.result === r ? styles[`resultCard${r}`] : ""}`}
              >
                <input
                  type="radio"
                  name="result"
                  value={r}
                  checked={form.result === r}
                  onChange={() => set("result", r)}
                />
                <span className={styles.resultCardIcon}>
                  {r === "Pass" ? "✅" : r === "Fail" ? "❌" : "🔁"}
                </span>
                <span className={styles.resultCardLabel}>{r}</span>
                <span className={styles.resultCardDesc}>
                  {r === "Pass"
                    ? "Accept batch — move to stores"
                    : r === "Fail"
                      ? "Reject batch — return to vendor"
                      : "Send back for rework / re-inspection"}
                </span>
              </label>
            ))}
          </div>

          {/* Auto-result hint */}
          <p className={styles.autoHint}>
            💡 Result is auto-suggested based on rejection rate and check
            outcomes. You can override it.
          </p>
        </div>

        {error && <div className={styles.errorBanner}>⚠ {error}</div>}

        {/* Footer */}
        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push("/dashboard/quality/iqc")}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Entry" : "Submit IQC Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
