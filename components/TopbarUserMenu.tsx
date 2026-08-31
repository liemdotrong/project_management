"use client";

import { useState } from "react";
import { logout } from "@/actions/auth.actions";
import { LogOut, User, Settings } from "lucide-react";

export default function TopbarUserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer ring-2 ring-white hover:ring-indigo-100 transition-all"
      >
        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-wider">{user?.role}</p>
            </div>
            
            <a href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
              <Settings size={14} /> Admin Settings
            </a>
            
            <button 
              onClick={() => logout()} 
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
