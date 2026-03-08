import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // delete bills of invoices
    await prisma.bill.deleteMany({
      where: {
        invoice: {
          companyId: id
        }
      }
    });

    // delete invoices
    await prisma.invoice.deleteMany({
      where: { companyId: id }
    });

    // delete company
    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE COMPANY FAILED:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}