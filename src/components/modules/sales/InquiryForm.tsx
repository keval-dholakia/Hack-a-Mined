"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInquiry, updateInquiry } from "@/app/actions/inquiries";
import type { InquiryFormData, InquiryItemFormData } from "@/types/inquiry";
import type { SessionUser } from "@/types/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import styles from "./Sales.module.scss";

type Props = {
  inquiry?: any;
  customers: any[];
  products: any[];
  currentUser: SessionUser | null;
};

const EMPTY_ITEM: InquiryItemFormData = {
  product_id: 0,
  quantity: 1,
  target_price: 0,
  current_stock: 0,
  blocked_stock: 0,
  net_available: 0,
};

export default function InquiryForm({
  inquiry,
  customers,
  products,
  currentUser,
}: Props) {
  const router = useRouter();
  const isEdit = !!inquiry;

  const [form, setForm] = useState<InquiryFormData>({
    inquiry_no: inquiry?.inquiry_no ?? "",
    customer_id: inquiry?.customer_id ?? 0,
    inquiry_date:
      inquiry?.inquiry_date ?? new Date().toISOString().split("T")[0],
    sales_person_id: inquiry?.sales_person_id ?? currentUser?.id ?? null,
    status: inquiry?.status ?? "New",
    delivery_date: inquiry?.delivery_date ?? "",
    remarks: inquiry?.remarks ?? "",
    items: inquiry?.items?.map((i: any) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      target_price: i.target_price ?? 0,
      current_stock: i.current_stock,
      blocked_stock: i.blocked_stock,
      net_available: i.net_available,
    })) ?? [{ ...EMPTY_ITEM }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof InquiryFormData, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Item helpers ──────────────────────────
  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function updateItem(
    index: number,
    key: keyof InquiryItemFormData,
    value: any,
  ) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };

      // Auto fill stock info when product selected
      if (key === "product_id") {
        const product = products.find((p) => p.id === Number(value));
        if (product) {
          items[index].current_stock = product.current_stock ?? 0;
          items[index].blocked_stock = 0;
          items[index].net_available = product.current_stock ?? 0;
        }
      }

      // Auto calc delivery date based on stock vs quantity
      if (key === "quantity" || key === "product_id") {
        const item = items[index];
        const today = new Date();
        const netAvail = item.net_available;

        if (netAvail >= item.quantity) {
          today.setDate(today.getDate() + 2);
        } else {
          today.setDate(today.getDate() + 14); // default production time
        }

        const deliveryDate = today.toISOString().split("T")[0];
        return { ...prev, items, delivery_date: deliveryDate };
      }

      return { ...prev, items };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.items.length === 0) {
      setError("Add at least one item");
      return;
    }
    if (form.items.some((i) => i.product_id === 0)) {
      setError("Select a product for all items");
      return;
    }

    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updateInquiry(inquiry.id, form)
      : await createInquiry(form);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard/sales/inquiry");
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? "Edit Inquiry" : "New Inquiry"}
          </h1>
          <p className={styles.subtitle}>
            {isEdit
              ? `Editing ${inquiry.inquiry_no}`
              : "Create a new customer inquiry"}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* Header Details */}
          <Card title="Inquiry Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>
                  Inquiry No <span className={styles.req}>*</span>
                </label>
                <input
                  required
                  placeholder="e.g. INQ-2024-001"
                  value={form.inquiry_no}
                  onChange={(e) => setField("inquiry_no", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>
                  Inquiry Date <span className={styles.req}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.inquiry_date}
                  onChange={(e) => setField("inquiry_date", e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>
                  Customer <span className={styles.req}>*</span>
                </label>
                <select
                  required
                  value={form.customer_id}
                  onChange={(e) =>
                    setField("customer_id", Number(e.target.value))
                  }
                >
                  <option value={0}>Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Processing">Processing</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={form.delivery_date}
                  onChange={(e) => setField("delivery_date", e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Any notes..."
                  value={form.remarks}
                  onChange={(e) => setField("remarks", e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Stock Summary */}
          {form.items.some((i) => i.product_id > 0) && (
            <Card title="Stock Summary">
              <div className={styles.stockGrid}>
                {form.items
                  .filter((i) => i.product_id > 0)
                  .map((item, idx) => {
                    const product = products.find(
                      (p) => p.id === item.product_id,
                    );
                    const isAvail = item.net_available >= item.quantity;
                    return (
                      <div
                        key={idx}
                        className={`${styles.stockCard} ${isAvail ? styles.stockOk : styles.stockLow}`}
                      >
                        <p className={styles.stockName}>{product?.name}</p>
                        <div className={styles.stockRow}>
                          <span>Current</span>
                          <strong>{item.current_stock}</strong>
                        </div>
                        <div className={styles.stockRow}>
                          <span>Required</span>
                          <strong>{item.quantity}</strong>
                        </div>
                        <div className={styles.stockRow}>
                          <span>Available</span>
                          <strong
                            style={{
                              color: isAvail ? "var(--green)" : "var(--red)",
                            }}
                          >
                            {item.net_available}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>

        {/* Items Table */}
        <Card title="Items">
          <div className={styles.itemsTable}>
            <div className={styles.itemsHeader}>
              <span>Product</span>
              <span>Qty</span>
              <span>Target Price (₹)</span>
              <span>Current Stock</span>
              <span>Net Available</span>
              <span></span>
            </div>

            {form.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <select
                  value={item.product_id}
                  onChange={(e) =>
                    updateItem(idx, "product_id", Number(e.target.value))
                  }
                  required
                >
                  <option value={0}>Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.code ? `(${p.code})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(idx, "quantity", Number(e.target.value))
                  }
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.target_price}
                  onChange={(e) =>
                    updateItem(idx, "target_price", Number(e.target.value))
                  }
                />
                <input
                  readOnly
                  value={item.current_stock}
                  className={styles.readOnly}
                />
                <input
                  readOnly
                  value={item.net_available}
                  className={`${styles.readOnly} ${item.net_available < item.quantity ? styles.stockAlert : ""}`}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeItem(idx)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className={styles.addRowBtn}
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>
        </Card>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Inquiry"
                : "Create Inquiry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
