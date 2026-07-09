import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to become a rider" }, { status: 401 });
    }

    const existingRider = await prisma.rider.findUnique({ where: { userId: user.id } });
    if (existingRider) {
      return NextResponse.json({
        rider: existingRider,
        message: existingRider.status === "pending"
          ? "Your application is pending approval"
          : "You are already registered as a rider",
      });
    }

    const body = await request.json();
    const { vehicleType, coverageArea } = body;

    const rider = await prisma.rider.create({
      data: {
        userId: user.id,
        vehicleType: vehicleType || null,
        coverageArea: coverageArea || null,
        status: "pending",
        isOnline: false,
      },
    });

    const hasRiderRole = user.roles.some((r) => r.role === "rider");
    if (!hasRiderRole) {
      await prisma.userRole.create({
        data: { userId: user.id, role: "rider" },
      });
    }

    return NextResponse.json({ rider, status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("Rider onboarding error:", error);
    return NextResponse.json({ error: "Failed to create rider profile" }, { status: 500 });
  }
}
