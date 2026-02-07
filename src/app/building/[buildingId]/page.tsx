'use client';

// We go up 3 levels (../../../) to get out of the "building" and "app" folders
// and find the "components" folder.
import { FloorsDashboard } from '../../../components/FloorsDashboard';

export default function BuildingDetailsPage() {
  return (
    <main>
      <FloorsDashboard />
    </main>
  );
}