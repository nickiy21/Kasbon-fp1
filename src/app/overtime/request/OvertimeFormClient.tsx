"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/constants";

export default function OvertimeFormClient({ user, spvs }: { user: any, spvs: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    address: "",
    phoneNumber: "",
    overtimeDay: "",
    overtimeDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    spvId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengajukan lembur");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Nama Lengkap (Otomatis)
          </label>
          <input
            type="text"
            value={user.name}
            disabled
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-100 p-3 text-xs font-bold text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Divisi (Otomatis)
          </label>
          <input
            type="text"
            value={user.division}
            disabled
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-100 p-3 text-xs font-bold text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Alamat <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
            placeholder="Masukkan alamat lengkap..."
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            No. Telepon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
            placeholder="Contoh: 081234567890"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Hari Lembur <span className="text-red-500">*</span>
          </label>
          <select
            name="overtimeDay"
            required
            value={formData.overtimeDay}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
          >
            <option value="">Pilih Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
            <option value="Minggu">Minggu</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Tanggal Lembur <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="overtimeDate"
            required
            value={formData.overtimeDate}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Dari Jam <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="time"
              name="startTime"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 pl-10 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
            />
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            S/D Jam <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="time"
              name="endTime"
              required
              value={formData.endTime}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 pl-10 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
            />
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Alasan / Keperluan Lembur <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            required
            rows={4}
            value={formData.reason}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
            placeholder="Jelaskan secara singkat keperluan lembur Anda..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Pilih SPV Penyetuju <span className="text-red-500">*</span>
          </label>
          <select
            name="spvId"
            required
            value={formData.spvId}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
          >
            <option value="">-- Pilih Supervisor / Manajer --</option>
            {spvs.map((spv) => (
              <option key={spv.id} value={spv.id}>
                {spv.name || spv.username} ({ROLE_LABELS[spv.role] || spv.role} {spv.division ? `- Divisi ${spv.division}` : ""})
              </option>
            ))}
          </select>
          <p className="mt-2 text-[10px] italic text-zinc-500">
            Silakan pilih SPV/Manajer yang berwenang untuk menyetujui lembur Anda. Form ini akan diteruskan ke antrean beliau.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-zinc-100">
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl bg-zinc-100 py-3.5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-all hover:bg-zinc-200 hover:text-zinc-900"
        >
          <span className="flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Kembali
          </span>
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] rounded-xl bg-red-600 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <Send size={16} /> {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
          </span>
        </button>
      </div>
    </form>
  );
}
