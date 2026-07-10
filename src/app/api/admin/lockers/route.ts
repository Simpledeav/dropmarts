import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.roles.some((r: { role: string }) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const lockers = await prisma.locker.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ lockers });
  } catch (error) {
    console.error("Lockers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch lockers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.roles.some((r: { role: string }) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, address, lat, lng, capacity } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const locker = await prisma.locker.create({
      data: {
        name,
        address: address || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        capacity: capacity ? parseInt(capacity) : 10,
      },
    });

    return NextResponse.json({ locker }, { status: 201 });
  } catch (error) {
    console.error("Locker create error:", error);
    return NextResponse.json({ error: "Failed to create locker" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.roles.some((r: { role: string }) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, address, lat, lng, capacity, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const locker = await prisma.locker.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(lat !== undefined && { lat: parseFloat(lat) }),
        ...(lng !== undefined && { lng: parseFloat(lng) }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ locker });
  } catch (error) {
    console.error("Locker update error:", error);
    return NextResponse.json({ error: "Failed to update locker" }, { status: 500 });
  }
}
