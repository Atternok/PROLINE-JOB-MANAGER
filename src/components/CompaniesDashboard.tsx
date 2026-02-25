"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ChevronRight, ChevronDown, Trash } from "lucide-react";
import { mockBuildings } from "../data/mockData";

export default function CompaniesDashboard() {
  const { buildingId, floorId } = useParams();
  const router = useRouter();

  const [floor, setFloor] = useState<any>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyRate, setCompanyRate] = useState("");
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [showInvoiceFormFor, setShowInvoiceFormFor] = useState<string | null>(null);

  useEffect(() => {
    const b = mockBuildings.find((b) => b.id === buildingId);
    const f = b?.floors.find((fl) => fl.id === floorId);
    if (f) setFloor({ ...f });
  }, [buildingId, floorId]);

  if (!floor) return null;

  const refresh = () => setFloor({ ...floor });

  // =========================
  // ADD COMPANY
  // =========================
  const addCompany = () => {
    if (!companyName.trim() || !companyRate.trim()) return;

    floor.companies.push({
      id: Date.now().toString(),
      name: companyName,
      poNumber: "",
      poValue: Number(companyRate), // 🔥 CORRECT FIELD
      poDate: "",
      invoices: []
    });

    refresh();
    setCompanyName("");
    setCompanyRate("");
    setShowAddCompany(false);
  };

  const deleteCompany = (companyId: string) => {
    if (!confirm("Delete this company?")) return;
    floor.companies = floor.companies.filter((c: any) => c.id !== companyId);
    refresh();
  };

  // =========================
  // ADD INVOICE (STRICT LIMITS)
  // =========================
  const addInvoice = (companyId: string, data: any) => {
    const company = floor.companies.find((c: any) => c.id === companyId);
    if (!company) return;

    const currentInvoiceTotal = company.invoices.reduce(
      (sum: number, inv: any) => sum + inv.value,
      0
    );

    const remaining = company.poValue - currentInvoiceTotal;

    if (remaining <= 0) {
      alert("No remaining balance for this company.");
      return;
    }

    if (data.value <= 0) {
      alert("Invoice must be greater than 0.");
      return;
    }

    if (data.value > remaining) {
      alert(`Invoice exceeds remaining balance (₹${remaining}).`);
      return;
    }

    company.invoices.push({
      id: Date.now().toString(),
      ...data,
      bills: []
    });

    refresh();
    setShowInvoiceFormFor(null);
  };

  const deleteInvoice = (companyId: string, invoiceId: string) => {
    if (!confirm("Delete this invoice?")) return;
    const company = floor.companies.find((c: any) => c.id === companyId);
    if (!company) return;

    company.invoices = company.invoices.filter(
      (i: any) => i.id !== invoiceId
    );

    refresh();
  };

  // =========================
  // ADD BILL (STRICT LIMITS)
  // =========================
  const addBill = (companyId: string, invoiceId: string, data: any) => {
    const company = floor.companies.find((c: any) => c.id === companyId);
    const invoice = company?.invoices.find((i: any) => i.id === invoiceId);
    if (!invoice) return;

    const currentBillTotal = invoice.bills.reduce(
      (sum: number, b: any) => sum + b.value,
      0
    );

    const remaining = invoice.value - currentBillTotal;

    if (remaining <= 0) {
      alert("No remaining balance for this invoice.");
      return;
    }

    if (data.value <= 0) {
      alert("Bill must be greater than 0.");
      return;
    }

    if (data.value > remaining) {
      alert(`Bill exceeds remaining invoice balance (₹${remaining}).`);
      return;
    }

    invoice.bills.push({
      id: Date.now().toString(),
      ...data
    });

    refresh();
  };

  const deleteBill = (companyId: string, invoiceId: string, billId: string) => {
    if (!confirm("Delete this bill?")) return;

    const company = floor.companies.find((c: any) => c.id === companyId);
    const invoice = company?.invoices.find((i: any) => i.id === invoiceId);
    if (!invoice) return;

    invoice.bills = invoice.bills.filter((b: any) => b.id !== billId);

    refresh();
  };

  const toggleInvoice = (id: string) => {
    const s = new Set(expandedInvoices);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedInvoices(s);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">

      <button
        onClick={() => router.push(`/building/${buildingId}`)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{floor.name}</h1>

        <button
          onClick={() => setShowAddCompany(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Company
        </button>
      </div>

      {floor.companies.map((c: any) => {
        const invoiceTotal = c.invoices.reduce(
          (s: number, i: any) => s + i.value,
          0
        );

        return (
          <div key={c.id} className="bg-white border rounded p-5 mb-6">

            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold uppercase">{c.name}</h2>
                <p className="text-sm text-gray-500">
                  Company Total: ₹{c.poValue}
                </p>
                <p className="text-sm text-gray-500">
                  Invoice Total: ₹{invoiceTotal}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setShowInvoiceFormFor(c.id)}
                  className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2"
                >
                  <Plus size={14} /> Add Invoice
                </button>

                <button
                  onClick={() => deleteCompany(c.id)}
                  className="text-red-600"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>

            {showInvoiceFormFor === c.id && (
              <InvoiceForm
                onCancel={() => setShowInvoiceFormFor(null)}
                onAdd={(data: any) => addInvoice(c.id, data)}
              />
            )}

            {c.invoices.map((inv: any) => {
              const open = expandedInvoices.has(inv.id);
              const billTotal = inv.bills.reduce(
                (s: number, b: any) => s + b.value,
                0
              );

              return (
                <div key={inv.id} className="border-t pt-3 mt-3">

                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleInvoice(inv.id)}
                  >
                    <div className="flex items-center gap-2">
                      {open ? <ChevronDown /> : <ChevronRight />}
                      <div>
                        <div className="font-medium">
                          {inv.name} — ₹{inv.value}
                        </div>
                        <div className="text-sm text-gray-500">
                          Bill Total: ₹{billTotal}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteInvoice(c.id, inv.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  {open && (
                    <div className="ml-6 mt-3">
                      <BillForm
                        onAdd={(data: any) =>
                          addBill(c.id, inv.id, data)
                        }
                      />

                      {inv.bills.map((b: any) => (
                        <div
                          key={b.id}
                          className="mt-2 text-sm flex justify-between items-center"
                        >
                          <div>
                            {b.name} — ₹{b.value} ({b.date})
                          </div>

                          <button
                            onClick={() =>
                              deleteBill(c.id, inv.id, b.id)
                            }
                            className="text-red-600"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {showAddCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="font-semibold mb-4">Add Company</h2>

            <input
              className="border p-2 w-full text-black bg-white mb-3"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <input
              type="number"
              className="border p-2 w-full text-black bg-white mb-4"
              placeholder="Total Amount"
              value={companyRate}
              onChange={(e) => setCompanyRate(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddCompany(false)}
                className="px-4 py-2 bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addCompany}
                className="px-4 py-2 bg-blue-600 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceForm({ onAdd, onCancel }: any) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="border rounded p-4 mb-4 bg-gray-50">
      <div className="flex gap-2 flex-wrap mb-3">
        <input className="border p-2 bg-white" placeholder="Invoice Name" onChange={e => setName(e.target.value)} />
        <input type="number" className="border p-2 bg-white" placeholder="Value" onChange={e => setValue(e.target.value)} />
        <input type="date" className="border p-2 bg-white" onChange={e => setDate(e.target.value)} />
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">
          Cancel
        </button>
        <button
          onClick={() =>
            onAdd({
              name,
              value: Number(value),
              date,
              fileUrl: file ? URL.createObjectURL(file) : undefined
            })
          }
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Create Invoice
        </button>
      </div>
    </div>
  );
}

function BillForm({ onAdd }: any) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      <input className="border p-2 bg-white" placeholder="Bill Name" onChange={e => setName(e.target.value)} />
      <input type="number" className="border p-2 bg-white" placeholder="Value" onChange={e => setValue(e.target.value)} />
      <input type="date" className="border p-2 bg-white" onChange={e => setDate(e.target.value)} />
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={() =>
          onAdd({
            name,
            value: Number(value),
            date,
            fileUrl: file ? URL.createObjectURL(file) : undefined
          })
        }
        className="bg-green-600 text-white px-3 rounded"
      >
        + Bill
      </button>
    </div>
  );
}