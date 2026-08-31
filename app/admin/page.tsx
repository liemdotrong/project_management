import { getUsers } from "@/actions/user.actions";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
