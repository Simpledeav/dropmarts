import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const VALID_TRANSITIONS: Record<string, string[]> = {
  accepted: ["picked_up"],
  picked_up: ["in_transit"],
  in_transit: ["delivered"],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.rider) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dispatch = await prisma.dispatchRequest.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!dispatch || dispatch.riderId !== user.rider.id) {
      return NextResponse.json({ error: "Dispatch not found or not assigned to you" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    const allowed = VALID_TRANSITIONS[dispatch.status];
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${dispatch.status}' to '${status}'` },
        { status: 400 }
      );
    }

    const updated = await prisma.dispatchRequest.update({
      where: { id },
      data: { status },
    });

    // Sync order status
    const orderStatusMap: Record<string, string> = {
      picked_up: "processing",
      in_transit: "in_transit",
      delivered: "delivered",
    };

    if (orderStatusMap[status]) {
      await prisma.order.update({
        where: { id: dispatch.orderId },
        data: { status: orderStatusMap[status] },
      });
    }

    return NextResponse.json({ dispatch: updated });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Failed to update delivery status" }, { status: 500 });
  }
}
