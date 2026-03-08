"use client";

import { useParams } from "next/navigation";
import CompaniesDashboard from "../../../../../components/CompaniesDashboard";

export default function FloorPage() {
  const { buildingId, floorId } = useParams();

  return (
    <CompaniesDashboard
      buildingId={buildingId as string}
      floorId={floorId as string}
    />
  );
}