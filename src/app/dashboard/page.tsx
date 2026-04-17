import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/DashboardClient";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { Plus, LayoutDashboard, History, Wallet, ChevronLeft, AlertCircle, ClipboardCheck } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      employeeProfile: true,
      requests: {
        orderBy: { submissionDate: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/login");

  // For Admin/Owner/Leader, get pending count and items
  const isApprover = user.role !== "EMPLOYEE";
  const pendingRequests = isApprover ? await prisma.kasbonRequest.findMany({
    where: { 
      status: user.role === "LEADER" ? "PENDING" : "LEADER_VERIFIED",
      division: user.role === "LEADER" ? ((user as any).division) : undefined
    } as any,
    include: { employee: true },
    orderBy: { submissionDate: "asc" },
    take: 5
  }) : [];

  const pendingCount = isApprover ? await prisma.kasbonRequest.count({
    where: { 
      status: user.role === "LEADER" ? "PENDING" : "LEADER_VERIFIED",
      division: user.role === "LEADER" ? ((user as any).division) : undefined
    } as any
  }) : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase flex items-center gap-3">
            {user.role === "EMPLOYEE" ? "Dashboard Karyawan" : "Dashboard Verifikator"}
            {(user as any).division && (
              <span className="bg-red-600 text-[10px] text-white px-2 py-0.5 rounded italic font-black">
                {(user as any).division}
              </span>
            )}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
        
        <div className="flex gap-3">
          {user.role === "EMPLOYEE" && (
            <Link href="/request" className="fastprix-button gap-2">
              <Plus size={18} /> Ajukan Kasbon Baru
            </Link>
          )}
          {isApprover && (
            <Link href="/history" className="fastprix-button bg-red-600/10 text-red-600 border-red-600/20 gap-2">
              <History size={18} /> Riwayat Kasbon
            </Link>
          )}
          {isApprover && (
            <Link href="/approvals" className="fastprix-button bg-zinc-900 gap-2">
              <ClipboardCheck size={18} /> Antrean Persetujuan
            </Link>
          )}
        </div>
      </header>

      {/* STATS SECTION */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isApprover && (
          <Link href="/approvals" className="fastprix-card border-l-4 border-l-red-600 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Menunggu Anda</span>
            </div>
            <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
              {pendingCount} Pengajuan
            </p>
          </Link>
        )}

        <div className="fastprix-card border-l-4 border-l-zinc-300">
          <div className="flex items-center gap-3 text-zinc-400">
            <LayoutDashboard size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Personal Histori</span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {user.requests.length} Data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* RECENT REQUESTS / APPROVALS */}
        <div className="lg:col-span-2">
          {isApprover ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-600">
                  <ClipboardCheck size={16} /> Antrean Persetujuan Divisi {(user as any).division || "Admin"}
                </h2>
                <Link href="/approvals" className="text-[10px] font-bold text-zinc-500 hover:text-red-600 uppercase tracking-widest">
                  Lihat Semua
                </Link>
              </div>
              
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="fastprix-card text-center text-zinc-500 py-10">
                    Tidak ada pengajuan yang menunggu persetujuan Anda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingRequests.map((req: any) => (
                      <div key={req.id} className="fastprix-card hover:border-red-600 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black italic text-red-600 uppercase">
                              {req.employeeName || req.employee?.name}
                            </span>
                            <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">
                              Rp{req.amount.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-zinc-400 italic">
                              "{req.purpose}"
                            </p>
                          </div>
                          <Link 
                            href="/approvals" 
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-[10px] font-black text-white hover:bg-red-600 transition-colors uppercase tracking-widest"
                          >
                            Buka Detail
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  <History size={16} /> Pengajuan Terakhir
                </h2>
              </div>
              
              <div className="space-y-4">
                {user.requests.length === 0 ? (
                  <div className="fastprix-card text-center text-zinc-500">
                    Belum ada data pengajuan kasbon.
                  </div>
                ) : (
                  user.requests.map((req: any) => (
                    <div key={req.id} className="fastprix-card flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black italic text-red-600">
                          Rp{req.amount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                          {req.purpose}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {format(new Date(req.submissionDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                            {req.status}
                         </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* SOP REMINDER / QUICK ACTIONS */}
        <div className="space-y-6">
          <div className="fastprix-card bg-zinc-900 px-6 py-8 text-white dark:bg-zinc-950 border-t-8 border-red-600">
            <h3 className="mb-6 text-xl font-black italic tracking-tighter text-red-500 uppercase">Pusat Informasi SOP</h3>
            <div className="space-y-6 text-[11px] leading-relaxed">
              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">1. KRITERIA KELAYAKAN</p>
                <ul className="space-y-2 text-zinc-400 list-disc pl-4">
                  <li>Bekerja minimal 6 bulan secara kontinu.</li>
                  <li>Tidak sedang dalam masa surat peringatan (SP).</li>
                  <li>Saldo kasbon sebelumnya sudah lunas 100%.</li>
                </ul>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">2. BATAS MAKSIMAL</p>
                <ul className="space-y-2 text-zinc-400 list-disc pl-4">
                  <li>Maksimal Kasbon: 20% dari gaji pokok.</li>
                  <li>Hanya untuk keperluan mendesak (Kesehatan, Pendidikan, Musibah).</li>
                  <li>Bukan untuk gaya hidup atau cicilan konsumtif.</li>
                </ul>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">3. WAKTU PENGAJUAN</p>
                <ul className="space-y-2 text-zinc-400 list-disc pl-4">
                  <li>Hanya tanggal 15 sd 20 setiap bulannya.</li>
                  <li>Di luar tanggal tersebut ditolak (kecuali Darurat Medis + Surat Dokter).</li>
                </ul>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">4. PROSEDUR (BIROKRASI)</p>
                <ol className="space-y-2 text-zinc-400 list-decimal pl-4">
                  <li>Isi Formulir Kasbon online/admin.</li>
                  <li>Verifikasi Leader (Kepala Regu).</li>
                  <li>Persetujuan Akhir Owner/Manager.</li>
                  <li>Pencairan Dana (Tunai/Transfer).</li>
                </ol>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">5. SKEMA PENGEMBALIAN</p>
                <ul className="space-y-2 text-zinc-400 list-disc pl-4">
                  <li>Dipotong langsung dari gaji bulan berjalan secara Lunas.</li>
                  <li>Maksimal tenor 2 bulan agar tidak membebani slip gaji.</li>
                </ul>
              </div>

              <div className="bg-red-600/20 p-4 border border-red-600/30 rounded-xl">
                <p className="font-black text-red-500 uppercase tracking-widest mb-2">6. SANKSI & LARANGAN</p>
                <p className="text-zinc-300 italic">
                  Dilarang kasbon antar rekan kerja di bengkel. Penyalahgunaan untuk judi online/negatif sanksi disiplin berat & hak kasbon dicabut permanen.
                </p>
              </div>
              
              <p className="text-[9px] font-bold text-zinc-600 uppercase pt-4">Berlaku Efektif: Mei 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
