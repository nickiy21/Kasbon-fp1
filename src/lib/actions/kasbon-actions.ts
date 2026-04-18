"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { differenceInMonths } from "date-fns";

export type KasbonResponse = {
  success: boolean;
  error?: string;
};

export async function submitKasbon(formData: FormData): Promise<KasbonResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;
  const amount = parseFloat(formData.get("amount") as string);
  const purpose = formData.get("purpose") as string;
  const repaymentMonths = parseInt(formData.get("repaymentMonths") as string || "1");
  
  // New Fields
  const employeeName = formData.get("employeeName") as string;
  const division = formData.get("division") as any; // Cast to Division enum
  const joinDateInput = formData.get("joinDate") as string;
  const spStatusInput = formData.get("spStatus") === "YA";
  const isPreviousPaidInput = formData.get("isPreviousPaid") === "YA";
  const basicSalaryInput = parseFloat(formData.get("basicSalary") as string);
  const spDescription = formData.get("spDescription") as string;

  // Validation
  if (isNaN(amount) || !purpose || !employeeName) {
    return { success: false, error: "Data tidak lengkap atau format salah." };
  }

  // --- CREATE REQUEST ---
  try {
    const joinDate = joinDateInput ? new Date(joinDateInput) : null;
    
    await prisma.kasbonRequest.create({
      data: {
        employeeId: userId,
        amount: amount,
        purpose: purpose,
        repaymentMonths: repaymentMonths,
        status: "PENDING",
        employeeName: employeeName,
        division: division,
        joinDate: joinDate && !isNaN(joinDate.getTime()) ? joinDate : null,
        spStatus: spStatusInput,
        spDescription: spDescription || null,
        isPreviousPaid: isPreviousPaidInput,
        basicSalary: isNaN(basicSalaryInput) ? null : basicSalaryInput,
        isMedicalEmergency: false,
      } as any,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("CRITICAL ERROR SAVING KASBON:", err);
    return { success: false, error: "Terjadi kesalahan saat menyimpan data ke database. Silakan coba lagi." };
  }
}

export async function verifyByLeader(requestId: string, approve: boolean): Promise<KasbonResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LEADER" && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const request = await prisma.kasbonRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) return { success: false, error: "Request not found" };

    const reqDivision = (request as any).division;
    const userDivision = (session.user as any).division;

    console.log("DEBUG APPROVAL:", {
      userRole: session.user.role,
      userDivision: userDivision,
      requestDivision: reqDivision
    });

    // SPV check division match (unless Admin/Owner)
    if (session.user.role === "LEADER") {
      if (!userDivision || userDivision !== reqDivision) {
        return { success: false, error: `Anda tidak memiliki akses ke divisi ${reqDivision}. (Akun Anda: ${userDivision || 'Tanpa Divisi'})` };
      }
    }

    await prisma.kasbonRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "LEADER_VERIFIED" : "REJECTED",
        leaderId: session.user.id,
      },
    });
    revalidatePath("/approvals");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Gagal memproses verifikasi." };
  }
}

export async function approveByOwner(requestId: string, approve: boolean): Promise<KasbonResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.kasbonRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "APPROVED" : "REJECTED",
        ownerId: session.user.id,
      },
    });
    revalidatePath("/approvals");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Gagal memproses persetujuan." };
  }
}
