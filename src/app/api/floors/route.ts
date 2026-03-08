import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const floor = await prisma.floor.create({
      data: {
        name: body.name,
        buildingId: body.buildingId
      }
    });

    return NextResponse.json(floor);

  } catch (error) {
    console.error("CREATE floor failed:", error);

    return NextResponse.json(
      { error: "Failed to create floor" },
      { status: 500 }
    );
  }
}