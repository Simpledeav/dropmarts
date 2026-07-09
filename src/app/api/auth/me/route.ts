import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles.map((r) => r.role),
        vendor: user.vendor
          ? {
              id: user.vendor.id,
              businessName: user.vendor.businessName,
              status: user.vendor.status,
            }
          : null,
        rider: user.rider
          ? {
              id: user.rider.id,
              status: user.rider.status,
              isOnline: user.rider.isOnline,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
