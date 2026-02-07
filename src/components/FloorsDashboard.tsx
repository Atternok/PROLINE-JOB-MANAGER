"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { mockBuildings } from "../data/mockData";

export function FloorsDashboard() {
  const { buildingId } = useParams();
  const router = useRouter();

  const [building, setBuilding] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [floorName, setFloorName] = useState("");

  useEffect(() => {
    const b = mockBuildings.find(b => b.id === buildingId);
    if (b) setBuilding({ ...b });
  }, [buildingId]);

  if (!building) {
    return (
      <div className="p-6 text-black">
        <h1 className="text-xl font-semibold">Building not found</h1>
      </div>
    );
  }

  const addFloor = () => {
    if (!floorName.trim()) return;

    building.floors.push({
      id: Date.now().toString(),
      name: floorName,
      companies: []
    });

    setBuilding({ ...building });
    setFloorName("");
    setShowAdd(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{building.name}</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Floor
        </button>
      </div>

      {/* EMPTY STATE */}
      {building.floors.length === 0 && (
        <div className="border rounded p-6 bg-white text-gray-500">
          No floors yet
        </div>
      )}

      {/* FLOORS LIST */}
      {building.floors.map((f: any) => (
        <div
          key={f.id}
          onClick={() =>
            router.push(`/building/${building.id}/floor/${f.id}`)
          }
          className="border rounded p-4 mb-3 bg-white cursor-pointer hover:bg-gray-50"
        >
          <div className="font-medium">{f.name}</div>
          <div className="text-sm text-gray-500">Progress: 0%</div>
        </div>
      ))}

      {/* ADD FLOOR MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="font-semibold mb-4">Add Floor</h2>

            <input
              className="border p-2 w-full mb-4"
              placeholder="Floor name (e.g. Ground Floor)"
              value={floorName}
              onChange={e => setFloorName(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addFloor}
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
