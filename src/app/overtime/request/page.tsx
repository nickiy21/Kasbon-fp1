import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OvertimeFormClient from "./OvertimeFormClient";

export default async function OvertimeRequestPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/overtime/request");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  // Fetch users who can be SPVs
  // For simplicity, anyone with roles other than EMPLOYEE can potentially be selected
  // The user requested: "karyawan bebas memilih spv siapa saja"
  const potentialSpvs = await prisma.user.findMany({
    where: {
      role: {
        not: "EMPLOYEE"
      }
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      division: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black italic tracking-tighter text-zinc-900 uppercase">
          Surat Permohonan Lembur
        </h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">
          Isi formulir di bawah ini untuk mengajukan lembur.
        </p>
      </div>

      <div className="fastprix-card">
        <OvertimeFormClient 
          user={{
            name: user.name || user.username,
            division: user.division || "OTHERS",
          }} 
          spvs={potentialSpvs} 
        />
      </div>
    </div>
  );
}
