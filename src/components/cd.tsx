"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Upload, Plus } from "lucide-react";
import { findFloor, calculateCompanyTotalAmount, mockBuildings, Floor, Company, Invoice, Bill } from "../data/mockData";

interface CompaniesDashboardProps {
  buildingId: string;
  floorId: string;
}

export function CompaniesDashboard({ buildingId, floorId }: CompaniesDashboardProps) {
  const router = useRouter();
  const [floor, setFloor] = useState<Floor | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Form states for adding company
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyPO, setNewCompanyPO] = useState("");
  const [newCompanyPOValue, setNewCompanyPOValue] = useState("");

  // Inline form states for invoices (per company)
  const [invoiceValues, setInvoiceValues] = useState<Record<string, string>>({});
  const [invoiceFiles, setInvoiceFiles] = useState<Record<string, File | null>>({});

  // Inline form states for bills (per invoice)
  const [billValues, setBillValues] = useState<Record<string, string>>({});
  const [billFiles, setBillFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    const foundFloor = findFloor(buildingId, floorId);
    if (foundFloor) {
      setFloor(foundFloor);
    }
  }, [buildingId, floorId]);

  const toggleCompanyExpanded = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const toggleInvoiceExpanded = (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompanyName.trim() && newCompanyPO.trim() && newCompanyPOValue && floor) {
      const newCompany: Company = {
        id: Date.now().toString(),
        name: newCompanyName.trim(),
        poNumber: newCompanyPO.trim(),
        poValue: parseFloat(newCompanyPOValue),
        billNumber: "",
        invoices: []
      };
      
      // Update mockBuildings directly
      const building = mockBuildings.find(b => b.id === buildingId);
      if (building) {
        const floorInDb = building.floors.find(f => f.id === floorId);
        if (floorInDb) {
          floorInDb.companies.push(newCompany);
          setFloor({...floorInDb});
        }
      }
      
      setNewCompanyName("");
      setNewCompanyPO("");
      setNewCompanyPOValue("");
      setShowAddCompanyDialog(false);
    }
  };

  const handleAddInvoice = (companyId: string) => {
    const value = invoiceValues[companyId];
    if (!value || parseFloat(value) <= 0) {
      alert("Please enter a valid invoice value");
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      name: `Invoice ${Date.now()}`,
      value: parseFloat(value),
      bills: []
    };

    // Update mockBuildings directly
    const building = mockBuildings.find(b => b.id === buildingId);
    if (building) {
      const floorInDb = building.floors.find(f => f.id === floorId);
      if (floorInDb) {
        const company = floorInDb.companies.find(c => c.id === companyId);
        if (company) {
          company.invoices.push(newInvoice);
          setFloor({...floorInDb});
          setInvoiceValues({ ...invoiceValues, [companyId]: "" });
          setInvoiceFiles({ ...invoiceFiles, [companyId]: null });
        }
      }
    }
  };

  const handleAddBill = (companyId: string, invoiceId: string) => {
    const key = `${companyId}-${invoiceId}`;
    const value = billValues[key];
    if (!value || parseFloat(value) <= 0) {
      alert("Please enter a valid bill value");
      return;
    }

    const newBill: Bill = {
      id: Date.now().toString(),
      name: `Bill ${Date.now()}`,
      value: parseFloat(value)
    };

    // Update mockBuildings directly
    const building = mockBuildings.find(b => b.id === buildingId);
    if (building) {
      const floorInDb = building.floors.find(f => f.id === floorId);
      if (floorInDb) {
        const company = floorInDb.companies.find(c => c.id === companyId);
        if (company) {
          const invoice = company.invoices.find(inv => inv.id === invoiceId);
          if (invoice) {
            invoice.bills.push(newBill);
            setFloor({...floorInDb});
            setBillValues({ ...billValues, [key]: "" });
            setBillFiles({ ...billFiles, [key]: null });
          }
        }
      }
    }
  };

  const handleInvoiceFileChange = (companyId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInvoiceFiles({ ...invoiceFiles, [companyId]: file });
  };

  const handleBillFileChange = (companyId: string, invoiceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const key = `${companyId}-${invoiceId}`;
    const file = e.target.files?.[0] || null;
    setBillFiles({ ...billFiles, [key]: file });
  };

  if (!floor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Floor not found</h2>
          <button
            onClick={() => router.push(`/building/${buildingId}`)}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Return to Building
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/building/${buildingId}`)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Floors
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="mb-0">{floor.name}</h1>
            <button
              onClick={() => setShowAddCompanyDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </div>

        {/* Companies Summary Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">S.No.</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">PO No.</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">PO Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {floor.companies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No companies added yet. Click "Add Company" to get started.
                    </td>
                  </tr>
                ) : (
                  floor.companies.map((company, index) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 text-gray-700">{company.poNumber}</td>
                      <td className="px-6 py-4 text-gray-700">₹{company.poValue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-700">₹{calculateCompanyTotalAmount(company).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Company Sections with Invoices and Bills */}
        <div className="space-y-4">
          {floor.companies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow">
              {/* Company Header */}
              <div 
                className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCompanyExpanded(company.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedCompanies.has(company.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                  <h2 className="mb-0">{company.name}</h2>
                </div>
              </div>
              
              {/* Company Details (Expandable) */}
              {expandedCompanies.has(company.id) && (
                <div className="p-6 space-y-6">
                  {/* Add Invoice Section */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Invoice</h3>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Invoice Value (₹)
                        </label>
                        <input
                          type="number"
                          value={invoiceValues[company.id] || ""}
                          onChange={(e) => setInvoiceValues({ ...invoiceValues, [company.id]: e.target.value })}
                          placeholder="Enter invoice value"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Invoice
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleInvoiceFileChange(company.id, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <button
                        onClick={() => handleAddInvoice(company.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Invoice
                      </button>
                    </div>
                  </div>

                  {/* Invoices List */}
                  {company.invoices.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Invoices</h3>
                      {company.invoices.map((invoice, invIndex) => (
                        <div key={invoice.id} className="border border-gray-200 rounded-lg">
                          {/* Invoice Header */}
                          <div 
                            className="px-4 py-3 bg-blue-50 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleInvoiceExpanded(invoice.id)}
                          >
                            <div className="flex items-center gap-3">
                              {expandedInvoices.has(invoice.id) ? (
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="font-medium text-gray-900">Invoice {invIndex + 1}</span>
                              <span className="text-gray-600">₹{invoice.value.toLocaleString()}</span>
                            </div>
                            {invoice.fileUrl && (
                              <span className="text-xs text-green-600">File uploaded</span>
                            )}
                          </div>

                          {/* Invoice Details - Bills Section */}
                          {expandedInvoices.has(invoice.id) && (
                            <div className="p-4 space-y-4">
                              {/* Add Bill Section */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Add New Bill</h4>
                                <div className="flex items-end gap-3">
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Bill Value (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={billValues[`${company.id}-${invoice.id}`] || ""}
                                      onChange={(e) => setBillValues({ ...billValues, [`${company.id}-${invoice.id}`]: e.target.value })}
                                      placeholder="Enter bill value"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Upload Bill
                                    </label>
                                    <input
                                      type="file"
                                      onChange={(e) => handleBillFileChange(company.id, invoice.id, e)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleAddBill(company.id, invoice.id)}
                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Bill
                                  </button>
                                </div>
                              </div>

                              {/* Bills List */}
                              {invoice.bills.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Bills</h4>
                                  {invoice.bills.map((bill, billIndex) => (
                                    <div key={bill.id} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-900">Bill {billIndex + 1}</span>
                                        <span className="text-sm text-gray-600">₹{bill.value.toLocaleString()}</span>
                                      </div>
                                      {bill.fileUrl && (
                                        <span className="text-xs text-green-600">File uploaded</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Company Dialog */}
      {showAddCompanyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="mb-4">Add New Company</h2>
            <form onSubmit={handleAddCompany}>
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g., BASE AREA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  PO Number
                </label>
                <input
                  type="text"
                  id="poNumber"
                  value={newCompanyPO}
                  onChange={(e) => setNewCompanyPO(e.target.value)}
                  placeholder="e.g., 12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="poValue" className="block text-sm font-medium text-gray-700 mb-2">
                  PO Value (₹)
                </label>
                <input
                  type="number"
                  id="poValue"
                  value={newCompanyPOValue}
                  onChange={(e) => setNewCompanyPOValue(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCompanyDialog(false);
                    setNewCompanyName("");
                    setNewCompanyPO("");
                    setNewCompanyPOValue("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
