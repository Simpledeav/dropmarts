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

    const dispatch = await prisma.dispatchRequest.findUnique({ where: { id } });
    if (!dispatch) {
      return NextResponse.json({ error: "Dispatch request not found" }, { status: 404 });
    }

    if (dispatch.status !== "requested") {
      return NextResponse.json({ error: "Cannot decline this request" }, { status: 400 });
    }

    // Simply leave it as requested for other riders
    return NextResponse.json({ success: true, message: "Request declined" });
  } catch (error) {
    console.error("Decline dispatch error:", error);
    return NextResponse.json({ error: "Failed to decline dispatch request" }, { status: 500 });
  }
}
