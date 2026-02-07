"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { mockBuildings } from "../data/mockData";

export function BuildingsDashboard() {
  const router = useRouter();

  const [showAdd, setShowAdd] = useState(false);
  const [buildingName, setBuildingName] = useState("");

  const addBuilding = () => {
    if (!buildingName.trim()) return;

    mockBuildings.push({
      id: Date.now().toString(),
      name: buildingName,
      floors: []
    });

    setBuildingName("");
    setShowAdd(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buildings</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Building
        </button>
      </div>

      {/* BUILDINGS LIST */}
      {mockBuildings.length === 0 && (
        <div className="border rounded p-6 bg-white text-gray-500">
          No buildings yet
        </div>
      )}

      {mockBuildings.map((b) => (
        <div
          key={b.id}
          onClick={() => router.push(`/building/${b.id}`)}
          className="border rounded p-4 mb-3 bg-white cursor-pointer hover:bg-gray-50"
        >
          <div className="font-medium">{b.name}</div>
        </div>
      ))}

      {/* ADD BUILDING MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="font-semibold mb-4">Add New Building</h2>

            <input
              className="border p-2 w-full text-black bg-white mb-4"
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
                Add Building
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
