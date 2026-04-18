"use client";

import { useState } from "react";
import { submitKasbon } from "@/lib/actions/kasbon-actions";
import { 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  User, 
  ClipboardCheck, 
  ArrowRight,
  Info 
} from "lucide-react";
import { differenceInMonths } from "date-fns";

export default function KasbonForm({ basicSalary: initialSalary }: { basicSalary: number }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [showSOP, setShowSOP] = useState(false);

  // Form states for validation
  const [joinDate, setJoinDate] = useState("");
  const [spStatus, setSpStatus] = useState("TIDAK");
  const [spDescription, setSpDescription] = useState("");
  const [isPreviousPaid, setIsPreviousPaid] = useState("YA");
  const [requestAmount, setRequestAmount] = useState("");

  const formatNumber = (val: string) => {
    if (!val) return "";
    const num = val.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (val: string) => {
    return val.replace(/\./g, "");
  };

  const tenureInMonths = joinDate ? differenceInMonths(new Date(), new Date(joinDate)) : 0;
  const amountNum = parseFloat(parseNumber(requestAmount)) || 0;
  
  const isEligible = tenureInMonths >= 2 && isPreviousPaid === "YA" && amountNum > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) {
      setMessage({ type: "error", text: "Anda harus menyetujui ketentuan SOP sebelum mengirim." });
      return;
    }

    if (!isEligible) {
      setMessage({ type: "error", text: "Mohon maaf, Anda belum memenuhi kriteria SOP (Min. 2 bulan kerja & Kasbon sebelumnya lunas)." });
      return;
    }

    if (spStatus === "YA" && !spDescription) {
      setMessage({ type: "error", text: "Mohon isi deskripsi/penjelasan masa SP Anda." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("amount", parseNumber(requestAmount));

    const result = await submitKasbon(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Pengajuan kasbon berhasil dikirim! Menunggu verifikasi SPV Divisi." });
      setAgreed(false);
      form.reset();
      setJoinDate("");
      setRequestAmount("");
      setSpDescription("");
    } else {
      setMessage({ type: "error", text: result.error || "Gagal mengirim pengajuan." });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 relative">
      {/* SOP MODAL */}
      {showSOP && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="fastprix-card max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-zinc-900 px-6 py-8 text-white border-t-8 border-red-600 shadow-2xl">
            <h3 className="mb-6 text-xl font-black italic tracking-tighter text-red-500 uppercase">Pusat Informasi SOP</h3>
            <div className="space-y-6 text-[11px] leading-relaxed text-zinc-300">
              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">1. KRITERIA KELAYAKAN</p>
                <ul className="space-y-2 list-disc pl-4 text-zinc-400">
                  <li>Karyawan telah bekerja minimal 2 bulan secara kontinu.</li>
                  <li>Masa SP (Surat Peringatan) tetap dapat mengajukan dengan penjelasan.</li>
                  <li>Saldo kasbon sebelumnya sudah lunas 100%.</li>
                </ul>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">2. KEPERLUAN NOMINAL</p>
                <ul className="space-y-2 list-disc pl-4 text-zinc-400">
                  <li>Hanya untuk keperluan mendesak (Kesehatan, Pendidikan, Musibah).</li>
                  <li>Bukan untuk gaya hidup atau cicilan konsumtif.</li>
                </ul>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">3. WAKTU PENGAJUAN</p>
                <p className="text-zinc-400">Hanya tanggal 15 sd 20 setiap bulannya (kecuali darurat medis + surat dokter).</p>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">4. PROSEDUR PENGAJUAN (ALUR)</p>
                <ol className="space-y-2 list-decimal pl-4 text-zinc-400">
                  <li>Isi Formulir Kasbon online/admin.</li>
                  <li>Verifikasi Leader (Kepala Regu).</li>
                  <li>Persetujuan Akhir Owner/Manager.</li>
                  <li>Pencairan Dana (Tunai/Transfer).</li>
                </ol>
              </div>

              <div className="pb-4 border-b border-zinc-800">
                <p className="font-black text-white uppercase tracking-widest mb-2">5. SKEMA PENGEMBALIAN</p>
                <ul className="space-y-2 list-disc pl-4 text-zinc-400">
                  <li>Dipotong langsung dari gaji bulan berjalan secara Lunas.</li>
                  <li>Maksimal tenor 2 bulan agar tidak membebani slip gaji.</li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setShowSOP(false)}
              className="mt-8 w-full rounded-xl bg-white py-4 text-xs font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              SAYA MENGERTI & TUTUP
            </button>
          </div>
        </div>
      )}

      <div className="fastprix-card shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
            <DollarSign size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter">
              FORM PENGAJUAN <span className="text-red-600">KASBON</span>
            </h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">
              Official Internal Management System v2.0
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PERSONAL & WORK INFO */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <User size={14} /> Data Karyawan & Pekerjaan
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="employeeName"
                  required
                  className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 px-4 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  placeholder="Input nama lengkap sesuai KTP"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Divisi
                </label>
                <select
                  name="division"
                  required
                  className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 px-4 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white h-[46px]"
                >
                  <option value="DOORSMER" className="text-zinc-900 bg-white">DOORSMER</option>
                  <option value="MARKETING" className="text-zinc-900 bg-white">MARKETING</option>
                  <option value="MEKANIK" className="text-zinc-900 bg-white">MEKANIK</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Tanggal Masuk Kerja
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  required
                  className={`block w-full rounded-xl border-2 py-3 px-4 text-sm font-black text-black transition-all focus:outline-none focus:ring-4 ${joinDate && tenureInMonths < 2 ? 'border-red-500 focus:border-red-600 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-600 focus:ring-red-600/10'} bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                />
                {joinDate && tenureInMonths < 2 && (
                  <p className="mt-1 text-[10px] font-black text-red-600 animate-pulse uppercase">* Harus bekerja minimal 2 bulan</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: SOP QUESTIONS */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <ClipboardCheck size={14} /> Kepatuhan & SOP (Self Assessment)
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                   Sedang dalam masa SP?
                </label>
                <div className="flex gap-4">
                  {["TIDAK", "YA"].map((val) => (
                    <label key={val} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white py-3 text-zinc-900 transition-all hover:bg-red-50 cursor-pointer has-[:checked]:border-red-600 has-[:checked]:bg-red-600 has-[:checked]:text-white dark:border-zinc-700 dark:bg-zinc-950">
                      <input 
                        type="radio" 
                        name="spStatus" 
                        value={val} 
                        required 
                        className="hidden" 
                        checked={spStatus === val}
                        onChange={(e) => setSpStatus(e.target.value)}
                      />
                      <span className="text-xs font-black uppercase">{val}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Saldo Kasbon Sebelumnya Lunas?
                </label>
                <div className="flex gap-4">
                  {["YA", "TIDAK"].map((val) => (
                    <label key={val} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white py-3 text-zinc-900 transition-all hover:bg-emerald-50 cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-600 has-[:checked]:text-white dark:border-zinc-700 dark:bg-zinc-950">
                      <input 
                        type="radio" 
                        name="isPreviousPaid" 
                        value={val} 
                        required 
                        className="hidden" 
                        checked={isPreviousPaid === val}
                        onChange={(e) => setIsPreviousPaid(e.target.value)}
                      />
                      <span className="text-xs font-black uppercase">{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SP DESCRIPTION FIELD */}
            {spStatus === "YA" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Penjelasan Masa SP (Wajib diisi)
                </label>
                <textarea
                  name="spDescription"
                  required
                  value={spDescription}
                  onChange={(e) => setSpDescription(e.target.value)}
                  rows={3}
                  className="block w-full rounded-2xl border-2 border-red-600/30 bg-white py-4 px-4 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  placeholder="Berikan alasan atau penjelasan mengenai status SP Anda saat ini agar dapat dipertimbangkan oleh SPV/Admin..."
                />
              </div>
            )}
            
            {(isEligible && (joinDate || isPreviousPaid === "TIDAK")) && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-[10px] font-black uppercase text-red-600 border border-red-200">
                <AlertCircle size={16} />
                <div className="flex flex-col gap-1">
                   {tenureInMonths < 2 && <p>• Belum Bekerja 2 Bulan</p>}
                   {isPreviousPaid === "TIDAK" && <p>• Kasbon Sebelumnya Belum Lunas</p>}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: REQUEST DATA */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <DollarSign size={14} /> Data Pinjaman
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Nominal Kasbon
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-red-600">Rp</span>
                  <input
                    type="text"
                    name="amount"
                    required
                    value={formatNumber(requestAmount)}
                    onChange={(e) => setRequestAmount(parseNumber(e.target.value))}
                    className={`block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white`}
                    placeholder="Contoh: 500.000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Tenor Pelunasan
                </label>
                <select
                  name="repaymentMonths"
                  className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 px-4 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white h-[46px]"
                >
                  <option value="1">1 BULAN (POTONG GAJI BERIKUTNYA)</option>
                  <option value="2">2 BULAN</option>
                </select>
                <p className="mt-1 text-[9px] text-zinc-400 italic">* Maksimal tenor 2 bulan sesuai SOP</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Tujuan Penggunaan (Penjelasan Lengkap)
              </label>
              <textarea
                name="purpose"
                required
                rows={4}
                className="block w-full rounded-2xl border-2 border-zinc-200 bg-white py-4 px-4 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                placeholder="Jelaskan kebutuhan Anda secara detail agar mempermudah evaluasi SPV..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border-2 border-red-600/20 bg-red-600/5 p-4">
             <input 
               type="checkbox" 
               id="agreed"
               checked={agreed}
               onChange={(e) => setAgreed(e.target.checked)}
               className="h-5 w-5 rounded accent-red-600 cursor-pointer"
             />
             <label htmlFor="agreed" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
               Dengan ini saya sudah membaca ketentuan <button type="button" onClick={() => setShowSOP(true)} className="text-red-600 underline hover:text-red-700">sop dan layanan</button> yang berlaku.
             </label>
          </div>

          {message && (
            <div className={`flex items-center gap-4 rounded-2xl p-5 text-sm font-black uppercase tracking-tighter shadow-sm ${
              message.type === "success" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !agreed || !isEligible}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-red-600 hover:shadow-2xl hover:shadow-red-600/30 active:scale-[0.98] disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? "MENGIKIRIM DATA..." : <>KIRIM PENGAJUAN <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
