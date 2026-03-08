"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";
import { mockBuildings } from "../data/mockData";

export function FloorsDashboard() {
  const { buildingId } = useParams();
  const router = useRouter();
  const [building, setBuilding] = useState<any>(null);
  const [floorName, setFloorName] = useState("");

  useEffect(() => {
    const b = mockBuildings.find(b => b.id === buildingId);
    if (b) setBuilding(b);
  }, [buildingId]);

  if (!building) return null;

  const refresh = () => setBuilding({ ...building });

 const addFloor = async () => {
  if (!floorName.trim()) return;

  try {
    const res = await fetch("/api/floors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: floorName,
        buildingId: building.id
      })
    });

    if (!res.ok) {
      console.error("Failed to create floor");
      return;
    }

    setFloorName("");
    setShowAddFloor(false);

    // reload buildings so new floor appears
    loadBuildings();

  } catch (err) {
    console.error("Create floor failed:", err);
  }
};

  const deleteFloor = async (floorId: string) => {
  if (!confirm("Delete this floor?")) return;

  await fetch(`/api/floors/${floorId}`, {
    method: "DELETE"
  });

  window.location.reload();
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">

      <button
        onClick={() => router.push("/")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{building.name}</h1>
        <div className="flex gap-2">
          <input
            className="border p-2 text-black bg-white"
            placeholder="Floor name"
            value={floorName}
            onChange={e => setFloorName(e.target.value)}
          />
          <button
            onClick={addFloor}
            className="bg-blue-600 text-white px-4"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {building.floors.map((f: any) => (
        <div
          key={f.id}
          className="border rounded p-4 mb-3 bg-white flex justify-between items-center"
        >
          <div
            onClick={() =>
              router.push(`/building/${building.id}/floor/${f.id}`)
            }
            className="cursor-pointer font-medium"
          >
            {f.name}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFloor(f.id);
            }}
            className="text-red-600"
          >
            <Trash size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}