"use client";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BuildingPage() {
  const { buildingId } = useParams();
  const router = useRouter();

  const [building, setBuilding] = useState<any>(null);
  const [floorName, setFloorName] = useState("");

  const load = async () => {
    const res = await fetch("/api/buildings");
    const data = await res.json();

    const b = data.find((b: any) => b.id === buildingId);
    setBuilding(b);
  };

  useEffect(() => {
    load();
  }, [buildingId]);

  const addFloor = async () => {
    if (!floorName.trim()) return;

    await fetch("/api/floors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: floorName,
        buildingId,
      }),
    });

    setFloorName("");
    load();
  };

  if (!building) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">{building.name}</h1>
      <button
          onClick={() => router.push("/")}
          className="mb-4 text-blue-600 hover:underline"
>          ← Back
      </button>
      <div className="flex gap-2 mb-6">
        <input
          value={floorName}
          onChange={(e) => setFloorName(e.target.value)}
          placeholder="Floor name"
          className="border p-2"
        />
      
        <button
          onClick={addFloor}
          className="bg-blue-600 text-white px-4"
        >
          Add Floor
        </button>
      </div>
    
      {(building.floors ?? []).map((floor: any) => (
  <div
    key={floor.id}
    className="border p-4 rounded mb-3 flex justify-between items-center"
  >
    <div
      className="cursor-pointer"
      onClick={() =>
        router.push(`/building/${buildingId}/floor/${floor.id}`)
      }
    >
      {floor.name}
    </div>

    <button
      onClick={async () => {
        if (!confirm("Delete this floor?")) return;

        await fetch(`/api/floors/${floor.id}`, {
          method: "DELETE",
        });

        window.location.reload();
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