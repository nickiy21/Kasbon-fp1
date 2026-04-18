import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HistoryTableClient from "@/components/HistoryTableClient";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role === "EMPLOYEE") {
    redirect("/dashboard");
  }

  const role = session.user.role;
  const userDivision = (session.user as any).division;
  
  let requests: any[] = [];

  if (role === "LEADER") {
    // Leader sees all historical requests for their division (where they were involved)
    requests = await prisma.kasbonRequest.findMany({
      where: { 
        division: userDivision,
        status: { not: "PENDING" }
      } as any,
      include: { employee: true },
      orderBy: { submissionDate: "desc" },
    });
  } else if (role === "OWNER" || role === "ADMIN") {
    // Admin sees everything
    requests = await prisma.kasbonRequest.findMany({
      include: { employee: true },
      orderBy: { submissionDate: "desc" },
    });
  }

  // Serialize requests for the client component (dates to strings)
  const serializedRequests = JSON.parse(JSON.stringify(requests));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">
            RIWAYAT <span className="text-red-600">PENGAJUAN</span>
          </h1>
          <p className="mt-2 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
            Data Seluruh Kasbon - Sensus Mei 2026
          </p>
        </div>
        
        <Link href="/dashboard" className="flex w-fit items-center gap-2 rounded-xl border-2 border-zinc-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900">
          <ChevronLeft size={14} /> Kembali ke Dashboard
        </Link>
      </div>

      <HistoryTableClient initialRequests={serializedRequests} />
    </div>
  );
}

