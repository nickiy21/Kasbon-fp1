import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApprovalsList from "@/components/ApprovalsList";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role === "EMPLOYEE") {
    redirect("/dashboard");
  }

  const role = session.user.role;
  const userDivision = (session.user as any).division;
  let requests: any[] = [];

  if (role === "LEADER") {
    // Leader sees PENDING requests for their division
    requests = await prisma.kasbonRequest.findMany({
      where: { 
        status: "PENDING",
        division: userDivision
      } as any,
      include: { employee: true },
      orderBy: { submissionDate: "asc" },
    });
  } else if (role === "OWNER" || role === "ADMIN") {
    // Owner sees LEADER_VERIFIED requests
    requests = await prisma.kasbonRequest.findMany({
      where: { status: "LEADER_VERIFIED" },
      include: { employee: true },
      orderBy: { submissionDate: "asc" },
    });
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white">
          ANTREAN <span className="text-red-600">PERSETUJUAN</span>
        </h1>
        <p className="mt-2 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
          {role === "LEADER" ? "Step 2: Leader Verification" : "Step 3: Owner Approval"}
        </p>
      </div>

      <ApprovalsList initialRequests={JSON.parse(JSON.stringify(requests))} />
      
      <div className="mt-12 rounded-3xl bg-zinc-900 p-8 text-white">
        <h3 className="text-sm font-bold uppercase tracking-widest text-red-500">Panduan Verifikator</h3>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Tanggung Jawab Leader</span>
            <p className="mt-2 text-xs text-zinc-400">Memastikan alasan kasbon valid (Mendesak) dan kinerja karyawan baik.</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Tanggung Jawab Owner</span>
            <p className="mt-2 text-xs text-zinc-400">Memberikan persetujuan akhir berdasarkan verifikasi Leader dan kondisi keuangan workshop.</p>
          </div>
          <div className="flex flex-col justify-end italic text-zinc-500 text-[10px]">
            Sistem Kasbon FastPrix1 v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
