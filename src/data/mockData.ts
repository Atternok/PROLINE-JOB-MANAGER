// ---------- TYPES ----------

export type Bill = {
  id: string;
  name: string;
  value: number;
  date: string;
  fileUrl?: string;
};

export type Invoice = {
  id: string;
  name: string;
  value: number;
  date: string;
  fileUrl?: string;
  bills: Bill[];
};

export type Company = {
  id: string;
  name: string;
  poNumber: string;
  poValue: number;
  poDate?: string;
  invoices: Invoice[];
};

export type Floor = {
  id: string;
  name: string;
  companies: Company[];
};

export type Building = {
  id: string;
  name: string;
  floors: Floor[];
};

// ---------- EMPTY DATA ----------

export const mockBuildings: Building[] = [];

// ---------- CALCULATIONS ----------

export function calculateInvoiceTotal(invoice: Invoice): number {
  return invoice.bills.reduce((sum, b) => sum + b.value, 0);
}

export function calculateCompanyTotalAmount(company: Company): number {
  return company.invoices.reduce(
    (sum, inv) => sum + calculateInvoiceTotal(inv),
    0
  );
}

export function calculateFloorTotalCost(floor: Floor): number {
  return floor.companies.reduce((sum, c) => sum + c.poValue, 0);
}

export function calculateFloorPaidAmount(floor: Floor): number {
  return floor.companies.reduce(
    (sum, c) => sum + calculateCompanyTotalAmount(c),
    0
  );
}

export function calculateFloorPaymentPercentage(floor: Floor): number {
  const total = calculateFloorTotalCost(floor);
  if (total === 0) return 0;
  return Math.round((calculateFloorPaidAmount(floor) / total) * 100);
}

export function calculateBuildingPaymentPercentage(building: Building): number {
  const total = building.floors.reduce(
    (sum, f) => sum + calculateFloorTotalCost(f),
    0
  );
  if (total === 0) return 0;

  const paid = building.floors.reduce(
    (sum, f) => sum + calculateFloorPaidAmount(f),
    0
  );
  return Math.round((paid / total) * 100);
}
