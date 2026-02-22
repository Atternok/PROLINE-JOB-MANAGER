"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";
import { mockBuildings } from "../data/mockData";

export function BuildingsDashboard() {
  const router = useRouter();

  const [showAdd, setShowAdd] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [, forceUpdate] = useState({});

  const addBuilding = () => {
    if (!buildingName.trim()) return;

    mockBuildings.push({
      id: Date.now().toString(),
      name: buildingName,
      floors: []
    });

    setBuildingName("");
    setShowAdd(false);
    forceUpdate({});
  };

  const deleteBuilding = (id: string) => {
    if (!confirm("Delete this building?")) return;

    const index = mockBuildings.findIndex(b => b.id === id);
    if (index !== -1) mockBuildings.splice(index, 1);

    forceUpdate({});
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">

      {/* TOP HEADER */}
      <div className="bg-blue-600 py-6 text-center">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          JOB MANAGER
        </h1>
      </div>

      <div className="p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Buildings</h2>

          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Building
          </button>
        </div>

        {mockBuildings.length === 0 && (
          <div className="border rounded p-6 bg-white text-gray-500">
            No buildings yet
          </div>
        )}

        {mockBuildings.map((b) => (
          <div
            key={b.id}
            className="border rounded p-4 mb-3 bg-white flex justify-between items-center"
          >
            <div
              onClick={() => router.push(`/building/${b.id}`)}
              className="cursor-pointer font-medium"
            >
              {b.name}
            </div>

            <button
              onClick={() => deleteBuilding(b.id)}
              className="text-red-600"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}

        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-[400px]">
              <h2 className="font-semibold mb-4">Add Building</h2>

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
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}