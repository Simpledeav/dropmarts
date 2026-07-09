import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isVendor = user.roles.some((r) => r.role === "vendor");
    if (!isVendor || !user.vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: user.vendor.id },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Vendor fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isVendor = user.roles.some((r) => r.role === "vendor");
    if (!isVendor || !user.vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { businessName, category, description, logoUrl, bannerUrl, payoutBankName, payoutAccountNumber } = body;

    const vendor = await prisma.vendor.update({
      where: { id: user.vendor.id },
      data: {
        ...(businessName && { businessName }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(payoutBankName !== undefined && { payoutBankName }),
        ...(payoutAccountNumber !== undefined && { payoutAccountNumber }),
      },
    });

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ error: "Failed to update vendor profile" }, { status: 500 });
  }
}
