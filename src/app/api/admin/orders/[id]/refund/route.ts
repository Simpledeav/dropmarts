import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.roles.some((r: { role: string }) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Order has not been paid" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
        paymentStatus: "refunded",
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
