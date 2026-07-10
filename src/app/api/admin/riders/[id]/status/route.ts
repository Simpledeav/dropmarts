import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.roles.some((r: { role: string }) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rider = await prisma.rider.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ rider });
  } catch (error) {
    console.error("Rider status update error:", error);
    return NextResponse.json({ error: "Failed to update rider status" }, { status: 500 });
  }
}
