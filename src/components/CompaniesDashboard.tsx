"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import { mockBuildings } from "../data/mockData";

export default function CompaniesDashboard() {
  const { buildingId, floorId } = useParams();
  const router = useRouter();

  const [floor, setFloor] = useState<any>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [showInvoiceFormFor, setShowInvoiceFormFor] = useState<string | null>(null);

  useEffect(() => {
    const b = mockBuildings.find(b => b.id === buildingId);
    const f = b?.floors.find(fl => fl.id === floorId);
    if (f) setFloor({ ...f });
  }, [buildingId, floorId]);

  if (!floor) return null;

  const addCompany = () => {
    if (!companyName.trim()) return;

    floor.companies.push({
      id: Date.now().toString(),
      name: companyName,
      poNumber: "",
      poValue: 0,
      invoices: []
    });

    setFloor({ ...floor });
    setCompanyName("");
    setShowAddCompany(false);
  };

  const toggleInvoice = (id: string) => {
    const s = new Set(expandedInvoices);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedInvoices(s);
  };

  const addInvoice = (companyId: string, data: any) => {
    const company = floor.companies.find((c: any) => c.id === companyId);
    if (!company) return;

    company.invoices.push({
      id: Date.now().toString(),
      ...data,
      bills: []
    });

    setFloor({ ...floor });
    setShowInvoiceFormFor(null);
  };

  const addBill = (companyId: string, invoiceId: string, data: any) => {
    const company = floor.companies.find((c: any) => c.id === companyId);
    const invoice = company?.invoices.find((i: any) => i.id === invoiceId);
    if (!invoice) return;

    invoice.bills.push({
      id: Date.now().toString(),
      ...data
    });

    setFloor({ ...floor });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">

      {/* BACK BUTTON */}
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

      {floor.companies.length === 0 && (
        <div className="border rounded p-6 bg-white text-gray-500">
          No companies yet
        </div>
      )}

      {floor.companies.map((c: any) => (
        <div key={c.id} className="bg-white border rounded p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold uppercase">{c.name}</h2>
              <p className="text-sm text-gray-500">
                Invoices: {c.invoices.length}
              </p>
            </div>

            <button
              onClick={() => setShowInvoiceFormFor(c.id)}
              className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2"
            >
              <Plus size={14} /> Add Invoice
            </button>
          </div>

          {c.invoices.length === 0 && (
            <p className="text-sm text-gray-500 mb-3">
              No invoices yet
            </p>
          )}

          {showInvoiceFormFor === c.id && (
            <InvoiceForm
              onCancel={() => setShowInvoiceFormFor(null)}
              onAdd={(data) => addInvoice(c.id, data)}
            />
          )}

          {c.invoices.map((inv: any) => {
            const open = expandedInvoices.has(inv.id);

            return (
              <div key={inv.id} className="border-t pt-3 mt-3">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleInvoice(inv.id)}
                >
                  {open ? <ChevronDown /> : <ChevronRight />}

                  <div className="flex-1">
                    <div className="font-medium">
                      {inv.name} — ₹{inv.value}
                    </div>
                    <div className="text-sm text-gray-500">{inv.date}</div>
                  </div>

                  {inv.fileUrl && (
                    <a
                      href={inv.fileUrl}
                      target="_blank"
                      className="text-blue-600 text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      View PDF
                    </a>
                  )}
                </div>

                {open && (
                  <div className="ml-6 mt-3">
                    <BillForm onAdd={(data) => addBill(c.id, inv.id, data)} />

                    {inv.bills.map((b: any) => (
                      <div key={b.id} className="mt-2 text-sm">
                        {b.name} — ₹{b.value} ({b.date})
                        {b.fileUrl && (
                          <a
                            href={b.fileUrl}
                            target="_blank"
                            className="text-blue-600 ml-2"
                          >
                            PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {showAddCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="font-semibold mb-4">Add Company</h2>

            <input
              className="border p-2 w-full text-black bg-white mb-4"
              placeholder="Company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
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
        <input className="border p-2 text-black bg-white" placeholder="Invoice Name" onChange={e => setName(e.target.value)} />
        <input type="number" className="border p-2 text-black bg-white" placeholder="Value" onChange={e => setValue(e.target.value)} />
        <input type="date" className="border p-2 text-black bg-white" onChange={e => setDate(e.target.value)} />
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
      <input className="border p-2 text-black bg-white" placeholder="Bill Name" onChange={e => setName(e.target.value)} />
      <input type="number" className="border p-2 text-black bg-white" placeholder="Value" onChange={e => setValue(e.target.value)} />
      <input type="date" className="border p-2 text-black bg-white" onChange={e => setDate(e.target.value)} />
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
