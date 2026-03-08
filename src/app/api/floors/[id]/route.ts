import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // delete bills
    await prisma.bill.deleteMany({
      where: {
        invoice: {
          company: {
            floorId: id
          }
        }
      }
    });

    // delete invoices
    await prisma.invoice.deleteMany({
      where: {
        company: {
          floorId: id
        }
      }
    });

    // delete companies
    await prisma.company.deleteMany({
      where: { floorId: id }
    });

    // delete floor
    await prisma.floor.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE FLOOR FAILED:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}