"use client";

import { useState } from "react";
import { createUser, updateUser, deleteUser } from "@/actions/user.actions";
import { User as UserIcon, Plus, Pencil, Trash2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserClient({ users }: { users: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    try {
      if (editingUser) {
        await updateUser(editingUser._id, data);
      } else {
        await createUser(data);
      }
      setShowModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        window.location.reload();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
        <p className="text-sm">Manage users and assign roles. Admin users have full access to the system.</p>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shrink-0">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                      {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full" alt="" /> : user.name.charAt(0)}
                    </div>
                    <div className="font-medium text-slate-800">{user.name}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md",
                    user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' :
                    user.role === 'PM' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-600'
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    {user.email}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(user._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <UserIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <p className="text-xs text-slate-500">{editingUser ? 'Update user information and role.' : 'Create a new user account.'}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" name="name" defaultValue={editingUser?.name} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" name="email" defaultValue={editingUser?.email} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input type="password" name="password" required={!editingUser} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                <select name="role" defaultValue={editingUser?.role || 'MEMBER'} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="PM">PM (Project Manager)</option>
                  <option value="MEMBER">MEMBER (Standard Access)</option>
                  <option value="VIEWER">VIEWER (Read Only)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
