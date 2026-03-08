"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";

export default function BuildingsDashboard() {
  const router = useRouter();

  const [buildings, setBuildings] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [buildingName, setBuildingName] = useState("");

  const loadBuildings = async () => {
    try {
      const res = await fetch("/api/buildings");

      if (!res.ok) {
        console.error("API error");
        return;
      }

      const data = await res.json();
      setBuildings(data);
    } catch (err) {
      console.error("Failed to load buildings:", err);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const addBuilding = async () => {
    if (!buildingName.trim()) return;

    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: buildingName
        })
      });

      if (!res.ok) {
        console.error("Failed to add building");
        return;
      }

      setBuildingName("");
      setShowAdd(false);
      loadBuildings();
    } catch (err) {
      console.error("Add building failed:", err);
    }
  };

const deleteBuilding = async (id: string) => {
  if (!confirm("Delete this building?")) return;

  try {
    const res = await fetch(`/api/buildings/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Delete failed:", text);
      return;
    }

    // reload buildings after delete
    loadBuildings();

  } catch (err) {
    console.error("Delete request error:", err);
  }
};
  const calculateCompanyPaid = (company: any) => {
    return company.invoices?.reduce((sum: number, inv: any) => {
      return (
        sum +
        inv.bills?.reduce((bSum: number, b: any) => bSum + b.value, 0)
      );
    }, 0);
  };

  const calculatePercentage = (company: any) => {
    if (!company.poValue || company.poValue === 0) return 0;
    const paid = calculateCompanyPaid(company);
    return Math.min(Math.round((paid / company.poValue) * 100), 100);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="text-center bg-blue-600 text-white text-3xl font-bold py-6 rounded mb-8">
        JOB MANAGER
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buildings</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Building
        </button>
      </div>

      {buildings.length === 0 && (
        <div className="text-gray-500 bg-white p-6 rounded border">
          No buildings yet
        </div>
      )}

      {buildings.map((building: any) => (
        <div
          key={building.id}
          className="bg-white rounded shadow p-6 mb-6 cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/building/${building.id}`)}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {building.name}
            </h2>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBuilding(building.id);
              }}
              className="text-red-600"
            >
              <Trash size={18} />
            </button>
          </div>

          {building.floors?.map((floor: any) => (
            <div key={floor.id} className="mt-6">
              <h3 className="font-semibold mb-4">
                {floor.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {floor.companies?.map((company: any) => {
                  const percent = calculatePercentage(company);

                  return (
                    <div
                      key={company.id}
                      className="border rounded p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold uppercase">
                          {company.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Total: ₹{company.poValue}
                        </p>
                        <p className="text-sm text-gray-500">
                          Paid: ₹{calculateCompanyPaid(company)}
                        </p>
                      </div>

                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="#2563eb"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 35}
                            strokeDashoffset={
                              2 * Math.PI * 35 * (1 - percent / 100)
                            }
                            strokeLinecap="round"
                          />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                          {percent}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="font-semibold mb-4">Add Building</h2>

            <input
              className="border p-2 w-full mb-4"
              placeholder="Building Name"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={addBuilding}
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