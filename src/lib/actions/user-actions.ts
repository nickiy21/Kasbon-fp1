"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const nik = formData.get("nik") as string;

  if (!username || !password || !nik) {
    return { success: false, error: "Nama Lengkap, Password, dan NIK wajib diisi" };
  }


  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nik,
        role: "EMPLOYEE",
        division: "MEKANIK", // Default starting division
      },
    });



    revalidatePath("/admin/members");
    return { success: true };
  } catch (error: any) {
    console.error("Registration error details:", error);
    // Provide a slightly more helpful error if it's a known prisma error
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('username')) {
        return { success: false, error: "Nama ini sudah terdaftar" };
      }
      if (error.meta?.target?.includes('nik')) {
        return { success: false, error: "NIK ini sudah terdaftar" };
      }
      return { success: false, error: "Data sudah terdaftar" };
    }

    return { success: false, error: `Gagal membuat akun: ${error.message || "Unknown error"}` };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function updateUserRole(userId: string, role: any) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/members");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update role" };
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: "Password minimal 4 karakter" };
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mereset password" };
  }
}

export async function getUsersWithStats() {
  try {
    const users = await prisma.user.findMany({
      include: {
        requests: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
