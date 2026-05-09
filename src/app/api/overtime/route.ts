import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
      address,
      phoneNumber,
      overtimeDay,
      overtimeDate,
      startTime,
      endTime,
      reason,
      spvId,
    } = body;

    if (!overtimeDay || !overtimeDate || !startTime || !endTime || !reason || !spvId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const overtimeRequest = await prisma.overtimeRequest.create({
      data: {
        employeeName: user.name || user.username,
        division: user.division || "OTHERS",
        address,
        phoneNumber,
        overtimeDay,
        overtimeDate: new Date(overtimeDate),
        startTime,
        endTime,
        reason,
        employeeId: user.id,
        spvId: spvId,
        status: "PENDING",
      },
    });

    return NextResponse.json(overtimeRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating overtime request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

    // Determine what to fetch based on user role
    const isApprover = ["ADMIN", "HC", "FINANCE", "DOORSMER", "MARKETING", "MEKANIK"].includes(user.role);

    if (user.role === "EMPLOYEE") {
      const requests = await prisma.overtimeRequest.findMany({
        where: { employeeId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(requests);
    } else {
      // Approvers see what's assigned to them
      let requests;
      if (user.role === "FINANCE") {
        // Finance sees SPV_APPROVED
        requests = await prisma.overtimeRequest.findMany({
          where: { 
            status: "SPV_APPROVED" 
          },
          include: { employee: true, spv: true },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // SPV sees PENDING where spvId = user.id
        requests = await prisma.overtimeRequest.findMany({
          where: { 
            status: "PENDING",
            spvId: user.id
          },
          include: { employee: true },
          orderBy: { createdAt: "desc" },
        });
      }
      return NextResponse.json(requests);
    }

  } catch (error) {
    console.error("Error fetching overtime requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
