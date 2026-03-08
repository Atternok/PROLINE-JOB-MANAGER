import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const buildings = await prisma.building.findMany({
      include: {
        floors: {
          include: {
            companies: {
              include: {
                invoices: {
                  include: {
                    bills: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // ensure arrays exist so UI never crashes
    const safe = buildings.map((b) => ({
      ...b,
      floors: b.floors?.map((f) => ({
        ...f,
        companies: f.companies ?? []
      })) ?? []
    }));

    return NextResponse.json(safe);

  } catch (error) {

    console.error("GET buildings failed:", error);

    return NextResponse.json([], { status: 200 });

  }
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const building = await prisma.building.create({
      data: {
        name: body.name
      }
    });

    return NextResponse.json(building);

  } catch (error) {

    console.error("CREATE building failed:", error);

    return NextResponse.json(
      { error: "Failed to create building" },
      { status: 500 }
    );

  }
}