import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const company = await prisma.company.create({
      data: {
        name: body.name,
        poValue: body.poValue,
        floorId: body.floorId
      }
    });

    return NextResponse.json(company);

  } catch (error) {
    console.error("CREATE COMPANY FAILED:", error);

    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}