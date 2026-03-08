import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const invoice = await prisma.invoice.create({
      data: {
        name: body.name,
        value: body.value,
        date: body.date,
        fileUrl: body.fileUrl,
        companyId: body.companyId
      }
    });

    return NextResponse.json(invoice);

  } catch (error) {
    console.error("CREATE INVOICE FAILED:", error);

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}