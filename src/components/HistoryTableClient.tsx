"use client";

import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Table as TableIcon,
  ChevronLeft,
  Calendar
} from "lucide-react";
import StatusBadge from "@/components/DashboardClient";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HistoryTableClientProps {
  initialRequests: any[];
}

export default function HistoryTableClient({ initialRequests }: HistoryTableClientProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = useMemo(() => {
    return initialRequests.filter((req) => {
      const reqDate = new Date(req.submissionDate);
      const isWithinDateRange = (!startDate || reqDate >= startOfDay(parseISO(startDate))) &&
                                (!endDate || reqDate <= endOfDay(parseISO(endDate)));
      
      const employeeName = (req.employeeName || req.employee?.name || "").toLowerCase();
      const purpose = (req.purpose || "").toLowerCase();
      const division = (req.division || "").toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) || 
                            purpose.includes(searchTerm.toLowerCase()) ||
                            division.includes(searchTerm.toLowerCase());

      return isWithinDateRange && matchesSearch;
    });
  }, [initialRequests, startDate, endDate, searchTerm]);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const formatData = (items: any[]) => items.map((req) => ({
      "Tanggal Pengajuan": format(new Date(req.submissionDate), "dd/MM/yyyy"),
      "Nama Karyawan": req.employeeName || req.employee?.name,
      "NIK": req.nik || "-",
      "Divisi": req.division,

      "SPV Verifikasi": req.leader?.username || req.leader?.name || "-",
      "Tujuan": req.purpose,
      "Nominal": req.amount,
      "Tenor (Bulan)": req.repaymentMonths,
      "Status": req.status,
      "Catatan": req.notes || "-",
    }));

    // Filter by categories
    const approved = filteredRequests.filter(r => r.status === "APPROVED" || r.status === "PAID");
    const rejected = filteredRequests.filter(r => r.status === "REJECTED");
    const pending = filteredRequests.filter(r => r.status === "PENDING" || r.status === "LEADER_VERIFIED");

    if (approved.length > 0) {
      const ws = XLSX.utils.json_to_sheet(formatData(approved));
      XLSX.utils.book_append_sheet(workbook, ws, "DISETUJUI_LUNAS");
    }
    if (rejected.length > 0) {
      const ws = XLSX.utils.json_to_sheet(formatData(rejected));
      XLSX.utils.book_append_sheet(workbook, ws, "DITOLAK");
    }
    if (pending.length > 0) {
      const ws = XLSX.utils.json_to_sheet(formatData(pending));
      XLSX.utils.book_append_sheet(workbook, ws, "MENUNGGU_PENDING");
    }

    // If everything is empty (unlikely with filteredRequests check), add an empty sheet
    if (workbook.SheetNames.length === 0) {
      const ws = XLSX.utils.json_to_sheet([{ Info: "Tidak ada data" }]);
      XLSX.utils.book_append_sheet(workbook, ws, "Data Kosong");
    }

    XLSX.writeFile(workbook, `Riwayat_Kasbon_Kategori_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  const exportToExcelGrouped = () => {
    const workbook = XLSX.utils.book_new();

    const generateGroupedData = (items: any[]) => {
      // Sort by name and division
      const sorted = [...items].sort((a, b) => {
        const nameA = (a.employeeName || a.employee?.name || "").toLowerCase();
        const nameB = (b.employeeName || b.employee?.name || "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        
        const divA = (a.division || "").toLowerCase();
        const divB = (b.division || "").toLowerCase();
        if (divA < divB) return -1;
        if (divA > divB) return 1;
        
        return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      });

      const processed: any[] = [];
      let lastEmployee = "";
      let lastDivision = "";

      sorted.forEach((req, index) => {
        const currentEmployee = req.employeeName || req.employee?.name || "";
        const currentDivision = req.division || "";

        if (index > 0 && (currentEmployee !== lastEmployee || currentDivision !== lastDivision)) {
          processed.push({}); // Spacing row
        }

        processed.push({
          "Tanggal Pengajuan": format(new Date(req.submissionDate), "dd/MM/yyyy"),
          "Nama Karyawan": currentEmployee,
          "NIK": req.nik || "-",
          "Divisi": currentDivision,

          "SPV Verifikasi": req.leader?.username || req.leader?.name || "-",
          "Tujuan": req.purpose,
          "Nominal": req.amount,
          "Tenor (Bulan)": req.repaymentMonths,
          "Status": req.status,
          "Catatan": req.notes || "-",
        });

        lastEmployee = currentEmployee;
        lastDivision = currentDivision;
      });

      return processed;
    };

    // Filter by categories
    const approved = filteredRequests.filter(r => r.status === "APPROVED" || r.status === "PAID");
    const rejected = filteredRequests.filter(r => r.status === "REJECTED");
    const pending = filteredRequests.filter(r => r.status === "PENDING" || r.status === "LEADER_VERIFIED");

    if (approved.length > 0) {
      const ws = XLSX.utils.json_to_sheet(generateGroupedData(approved));
      XLSX.utils.book_append_sheet(workbook, ws, "GRUP_DISETUJUI");
    }
    if (rejected.length > 0) {
      const ws = XLSX.utils.json_to_sheet(generateGroupedData(rejected));
      XLSX.utils.book_append_sheet(workbook, ws, "GRUP_DITOLAK");
    }
    if (pending.length > 0) {
      const ws = XLSX.utils.json_to_sheet(generateGroupedData(pending));
      XLSX.utils.book_append_sheet(workbook, ws, "GRUP_PENDING");
    }

    if (workbook.SheetNames.length === 0) {
      const ws = XLSX.utils.json_to_sheet([{ Info: "Tidak ada data" }]);
      XLSX.utils.book_append_sheet(workbook, ws, "Data Kosong");
    }

    XLSX.writeFile(workbook, `Riwayat_Kasbon_Grup_Terpisah_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };



  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Tgl", "Karyawan", "NIK", "Divisi", "SPV", "Nominal", "Status", "Catatan"];

    
    // Add title
    doc.setFontSize(18);
    doc.text("LAPORAN RIWAYAT KASBON", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    const dateRange = startDate && endDate 
      ? `Periode: ${format(parseISO(startDate), "dd/MM/yyyy")} - ${format(parseISO(endDate), "dd/MM/yyyy")}`
      : "Periode: Semua Data";
    
    doc.text(dateRange, 14, 28);
    doc.text(`Dicetak pada: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 34);

    let currentY = 45;

    const addSection = (title: string, data: any[], color: [number, number, number]) => {
      if (data.length === 0) return;

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(title, 14, currentY);
      
      const rows = data.map((req) => [
        format(new Date(req.submissionDate), "dd/MM/yy"),
        req.employeeName || req.employee?.name,
        req.nik || "-",
        req.division,
        req.leader?.username || req.leader?.name || "-",
        `Rp${req.amount.toLocaleString()}`,

        req.status,
        req.notes || "-",
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: rows,
        startY: currentY + 5,
        styles: { fontSize: 8 },
        headStyles: { fillColor: color },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
      
      // Check for page overflow
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    };

    const approved = filteredRequests.filter(r => r.status === "APPROVED" || r.status === "PAID");
    const rejected = filteredRequests.filter(r => r.status === "REJECTED");
    const pending = filteredRequests.filter(r => r.status === "PENDING" || r.status === "LEADER_VERIFIED");

    addSection("1. DATA KASBON DISETUJUI / LUNAS", approved, [16, 185, 129]); // Emerald 600
    addSection("2. DATA KASBON DITOLAK", rejected, [220, 38, 38]); // Red 600
    addSection("3. DATA KASBON MENUNGGU (PENDING)", pending, [217, 119, 6]); // Amber 600

    doc.save(`Riwayat_Kasbon_Terpisah_${format(new Date(), "yyyyMMdd")}.pdf`);
  };


  return (
    <div className="space-y-6">
      {/* FILTERS & ACTIONS */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end justify-between bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Calendar size={12} /> Dari Tanggal
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-bold focus:border-red-600 focus:ring-red-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Calendar size={12} /> Sampai Tanggal
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-bold focus:border-red-600 focus:ring-red-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Search size={12} /> Cari Nama/Keperluan
            </label>
            <input 
              type="text" 
              placeholder="Ketik untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-bold focus:border-red-600 focus:ring-red-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <TableIcon size={14} /> Excel (Kategori)
          </button>
          <button 
            onClick={exportToExcelGrouped}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
          >
            <TableIcon size={14} /> Excel (Grup Nama)
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            <FileText size={14} /> PDF
          </button>
        </div>

      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Tgl Pengajuan</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Karyawan</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">NIK</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Divisi</th>

                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">SPV</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nominal</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Tenor</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <span className="text-xs font-bold text-zinc-600">
                        {format(new Date(req.submissionDate), "dd MMM yyyy", { locale: id })}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-black text-zinc-900 uppercase tracking-tighter">
                        {req.employeeName || req.employee?.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 italic font-medium">"{req.purpose}"</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {req.nik || "-"}
                      </span>
                    </td>
                    <td className="p-4">

                      <span className="inline-block rounded bg-zinc-100 px-2 py-0.5 text-[9px] font-black text-zinc-600">
                        {req.division}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                        {req.leader?.username || req.leader?.name || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-black text-red-600">
                        Rp{req.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {req.repaymentMonths} Bulan
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-4">
                      <p className="max-w-[150px] truncate text-[10px] font-bold text-zinc-500 italic" title={req.notes}>
                        {req.notes || "-"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER SUMMARY */}
        <div className="bg-zinc-50 p-4 border-t border-zinc-200 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Menampilkan {filteredRequests.length} dari {initialRequests.length} data
          </p>
        </div>
      </div>
    </div>
  );
}
