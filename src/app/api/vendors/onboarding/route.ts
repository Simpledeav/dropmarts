import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to become a vendor" }, { status: 401 });
    }

    // Check if already a vendor
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    });

    if (existingVendor) {
      return NextResponse.json({
        vendor: existingVendor,
        message: existingVendor.status === "pending"
          ? "Your application is pending approval"
          : "You are already registered as a vendor",
      });
    }

    const body = await request.json();
    const { businessName, category, description } = body;

    if (!businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    // Create vendor record
    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        businessName,
        category: category || null,
        description: description || null,
        status: "pending", // Requires admin approval
      },
    });

    // Add vendor role if not already present
    const hasVendorRole = user.roles.some((r) => r.role === "vendor");
    if (!hasVendorRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: "vendor",
        },
      });
    }

    return NextResponse.json({ vendor, status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("Vendor onboarding error:", error);
    return NextResponse.json({ error: "Failed to create vendor profile" }, { status: 500 });
  }
}
