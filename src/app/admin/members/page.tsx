import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsersWithStats } from "@/lib/actions/user-actions";
import AdminMembersClient from "./AdminMembersClient";

export default async function AdminMembersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await getUsersWithStats();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 bg-white">
      <header className="mb-8">
        <h1 className="text-2xl font-black italic tracking-tighter text-zinc-900 uppercase">
          Kelola <span className="text-red-600">Member</span>
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Manajemen Akun & Histori Kasbon Karyawan
        </p>
      </header>

      <AdminMembersClient initialUsers={users} />
    </div>
  );
}
