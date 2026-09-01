import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { getAuthorizedMenus } from "@/actions/admin.actions";
import TopbarUserMenu from "@/components/TopbarUserMenu";
import { LayoutDashboard, CheckSquare, FolderGit2, Settings, Bell, Search, Menu as MenuIcon, Shield, Activity, FileText } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const IconMap: Record<string, any> = {
  LayoutDashboard, CheckSquare, FolderGit2, Settings, Shield, Activity, FileText
};

export const metadata: Metadata = {
  title: "ProManage | Project Management",
  description: "Professional project management app",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("pm_session");
  const currentUser = session ? JSON.parse(session.value) : null;

  // If no user is logged in, just render the content (which should be the login page)
  if (!currentUser) {
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="h-full bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    );
  }

  const authorizedMenus = await getAuthorizedMenus(currentUser.role);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full flex overflow-hidden bg-slate-50 text-slate-900">

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-4 flex-1">
              <a href="/" className="flex items-center mr-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-indigo-200">
                  <span className="text-white font-bold text-lg leading-none">P</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-800 hidden sm:block">ProManage</span>
              </a>
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

              {/* User Dropdown */}
              <TopbarUserMenu user={currentUser} />
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
