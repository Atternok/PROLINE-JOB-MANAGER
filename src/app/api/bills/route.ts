import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const bill = await prisma.bill.create({
      data: {
        name: body.name,
        value: body.value,
        date: body.date,
        fileUrl: body.fileUrl,
        invoiceId: body.invoiceId
      }
    });

    return NextResponse.json(bill);

  } catch (error) {
    console.error("CREATE BILL FAILED:", error);

    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    );
  }
}