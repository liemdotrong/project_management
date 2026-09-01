import { getUsers } from "@/actions/user.actions";
import AdminClient from "./AdminClient";
import { cookies } from "next/headers";
import { canAccessAdmin } from "@/lib/permissions";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("pm_session");
  const currentUser = session ? JSON.parse(session.value) : null;
  
  if (!currentUser || !canAccessAdmin(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <ShieldAlert size={48} className="text-rose-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
        <p>You do not have permission to view the System Administration screen.</p>
      </div>
    );
  }

  const users = await getUsers();
  
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Administration</h1>
        <p className="text-slate-500 text-sm mt-1">Manage users and assign system roles.</p>
      </div>
      
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <AdminClient initialUsers={users} />
      </div>
    </div>
  );
}
