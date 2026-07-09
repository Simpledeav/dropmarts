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
    if (!user?.rider) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.rider.status !== "approved") {
      return NextResponse.json({ error: "Your rider account must be approved first" }, { status: 403 });
    }

    const dispatch = await prisma.dispatchRequest.findUnique({ where: { id } });
    if (!dispatch) {
      return NextResponse.json({ error: "Dispatch request not found" }, { status: 404 });
    }

    if (dispatch.status !== "requested") {
      return NextResponse.json({ error: "This request is no longer available" }, { status: 400 });
    }

    // Accept the request
    const updated = await prisma.dispatchRequest.update({
      where: { id },
      data: {
        riderId: user.rider.id,
        status: "accepted",
        pickupAddress: "Vendor pickup location", // Would be real in production
        dropoffAddress: "Customer drop-off location",
        estimatedPayout: 2500, // Fixed demo payout
      },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, phone: true } },
            address: true,
            items: {
              include: { product: { select: { name: true } } },
            },
          },
        },
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: dispatch.orderId },
      data: { status: "confirmed" },
    });

    return NextResponse.json({ dispatch: updated });
  } catch (error) {
    console.error("Accept dispatch error:", error);
    return NextResponse.json({ error: "Failed to accept dispatch request" }, { status: 500 });
  }
}
