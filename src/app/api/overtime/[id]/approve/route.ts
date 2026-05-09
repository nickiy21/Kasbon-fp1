import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const { isApproved, notes } = await req.json();

    const request = await prisma.overtimeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    let newStatus = request.status;
    let updateData: any = {};

    if (!isApproved) {
      newStatus = "REJECTED";
      if (user.role === "FINANCE") {
        updateData.financeNotes = notes;
      } else {
        updateData.spvNotes = notes;
      }
    } else {
      if (request.status === "PENDING" && request.spvId === user.id) {
        // SPV Approval
        newStatus = "SPV_APPROVED";
        updateData.spvNotes = notes;
      } else if (request.status === "SPV_APPROVED" && user.role === "FINANCE") {
        // Finance Approval
        newStatus = "FINANCE_APPROVED";
        updateData.financeNotes = notes;
        updateData.financeId = user.id;
      } else {
         return NextResponse.json({ error: "Invalid state transition or unauthorized" }, { status: 400 });
      }
    }

    const updatedRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: newStatus as any,
        ...updateData,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating overtime request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
