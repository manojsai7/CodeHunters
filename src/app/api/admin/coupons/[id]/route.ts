import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const body = await request.json();

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;
    if (typeof body.discount === "number") updateData.discount = body.discount;
    if (typeof body.usageLimit === "number") updateData.usageLimit = body.usageLimit;
    if (body.expiresAt) updateData.expiresAt = new Date(body.expiresAt);

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update coupon error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Deactivate rather than hard delete
    await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Coupon deactivated successfully" });
  } catch (error) {
    console.error("Admin delete coupon error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate coupon" },
      { status: 500 }
    );
  }
}
