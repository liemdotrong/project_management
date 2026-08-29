import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, CheckSquare, FolderGit2, Settings, Bell, Search, Menu } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProManage | Project Management",
  description: "Professional project management app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full flex overflow-hidden bg-slate-50 text-slate-900">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 hidden">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-indigo-200">
              <span className="text-white font-bold text-lg leading-none">P</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">ProManage</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 group transition-colors">
              <LayoutDashboard size={18} className="text-slate-400 group-hover:text-indigo-500" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 group transition-colors">
              <CheckSquare size={18} className="text-indigo-600" /> Active Sprint
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 group transition-colors">
              <FolderGit2 size={18} className="text-slate-400 group-hover:text-indigo-500" /> Projects
            </a>
          </nav>
          
          <div className="p-4 border-t border-slate-100">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 group transition-colors">
              <Settings size={18} className="text-slate-400 group-hover:text-indigo-500" /> Settings
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Topbar */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-4 flex-1">
              <button className="lg:hidden text-slate-500 hover:text-slate-700">
                <Menu size={20} />
              </button>
              <div className="relative w-96 hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search tasks, projects..." className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all outline-none" />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer ring-2 ring-white">
                LD
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </main>
        </div>
        
      </body>
    </html>
  );
}
