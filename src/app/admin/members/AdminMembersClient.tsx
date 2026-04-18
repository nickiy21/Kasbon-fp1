"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, ChevronDown, ChevronUp, User, Calendar, CreditCard, Shield } from "lucide-react";
import { deleteUser, updateUserRole } from "@/lib/actions/user-actions";

export default function AdminMembersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun ini?")) return;
    setLoading(userId);
    const res = await deleteUser(userId);
    if (res.success) {
      setUsers(users.filter((u) => u.id !== userId));
    } else {
      alert("Gagal menghapus user");
    }
    setLoading(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId);
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      alert("Gagal mengupdate role");
    }
    setLoading(null);
  };

  const roles = ["EMPLOYEE", "HC", "FINANCE", "DOORSMER", "MARKETING", "MEKANIK", "LEADER", "ADMIN", "OWNER"];

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="fastprix-card border-l-4 border-l-zinc-200 hover:border-l-red-600 transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-zinc-900">
                  {user.username}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <Calendar size={10} />
                  Daftar: {format(new Date(user.createdAt), "dd MMM yyyy")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* ROLE SELECT */}
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-zinc-400" />
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loading === user.id}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-black uppercase text-zinc-600 focus:border-red-600 focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-200 transition-colors"
                >
                  Histori {expandedUser === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={loading === user.id}
                  className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* EXPANDED CONTENT: KASBON HISTORY */}
          {expandedUser === user.id && (
            <div className="mt-6 border-t border-zinc-100 pt-6 animate-in slide-in-from-top-2 duration-200">
              <h4 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <CreditCard size={12} /> Data Pengajuan Kasbon
              </h4>
              {user.requests && user.requests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-zinc-100 font-black uppercase text-zinc-400">
                        <th className="pb-2">Nominal</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold text-zinc-600">
                      {user.requests.map((req: any) => (
                        <tr key={req.id} className="border-b border-zinc-50 last:border-0">
                          <td className="py-2 text-red-600">Rp{req.amount.toLocaleString("id-ID")}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${
                              req.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                              req.status === "REJECTED" ? "bg-red-50 text-red-600" :
                              "bg-yellow-50 text-yellow-600"
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-2 text-right text-zinc-400">
                            {format(new Date(req.submissionDate), "dd/MM/yy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[10px] italic text-zinc-400 uppercase">Belum ada histori kasbon.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {users.length === 0 && (
        <div className="py-20 text-center text-zinc-400 uppercase font-black tracking-widest text-xs">
          Tidak ada data member.
        </div>
      )}
    </div>
  );
}
