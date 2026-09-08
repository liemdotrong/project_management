import { getProjectsOverview, createProject, deleteProject } from "@/actions/project.actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderGit2, AlertTriangle, CheckCircle2, Clock, Trash2, Plus, ArrowRight, BarChart3 } from "lucide-react";
import ConfirmForm from "@/components/ConfirmForm";

export const dynamic = "force-dynamic";

export default async function ProjectsDashboard(props: { searchParams: Promise<{ highlight?: string }> }) {
  const searchParams = await props.searchParams;
  const highlightId = searchParams.highlight;
  const cookieStore = await cookies();
  const session = cookieStore.get("pm_session");
  if (!session) {
    redirect("/login");
  }

  const currentUser = JSON.parse(session.value);
  const projects = await getProjectsOverview();

  const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
  const totalUsedBudget = projects.reduce((sum: number, p: any) => sum + (p.overview.usedBudget || 0), 0);
  const totalTasks = projects.reduce((sum: number, p: any) => sum + p.overview.totalTasks, 0);
  const totalOpenRisks = projects.reduce((sum: number, p: any) => sum + p.overview.openRiskCount, 0);

  return (
    <div className="p-8 flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Projects Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {currentUser.name}. Here is an overview of your projects.</p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FolderGit2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Projects</p>
              <h3 className="text-2xl font-bold text-slate-800">{projects.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Tasks</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalTasks}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Open Risks</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalOpenRisks}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Used / Total Budget</p>
              <h3 className="text-xl font-bold text-slate-800">
                ${totalUsedBudget.toLocaleString()} <span className="text-sm font-medium text-slate-400">/ ${totalBudget.toLocaleString()}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Form (Collapsible) */}
      <details className="mb-8 group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Plus size={18} />
            </div>
            Create New Project
          </div>
          <div className="text-xs text-slate-400 font-normal">
            <span className="group-open:hidden border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-sm">Expand</span>
            <span className="hidden group-open:block border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-sm">Collapse</span>
          </div>
        </summary>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <ConfirmForm action={createProject} actionName="Thêm Project" entityNameField="name">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name (Required)</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Website Redesign"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Code (Required)</label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. WEB-101"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget ($)</label>
                <input
                  type="number"
                  name="budget"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="col-span-1 md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  placeholder="Project details..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                <Plus size={18} />
                Create Project
              </button>
            </div>
          </ConfirmForm>
        </div>
      </details>

      {/* Projects Cards Grid */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">Your Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {projects.map((project: any) => {
          const budgetPercent = project.budget > 0 
            ? Math.min(Math.round((project.overview.usedBudget / project.budget) * 100), 100) 
            : 0;

          const isHighlighted = String(project._id) === highlightId;
          return (
            <div key={project._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-300 ${isHighlighted ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg scale-[1.01]' : 'border-slate-200 hover:shadow-md'}`}>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md border border-slate-200">
                      {project.code}
                    </span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {project.status}
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">Budget Used</span>
                    <span className="font-bold text-slate-800">${project.overview.usedBudget.toLocaleString()} / ${project.budget?.toLocaleString() || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${budgetPercent > 90 ? 'bg-rose-500' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${budgetPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div className="text-xs text-slate-500 mb-0.5">TODO</div>
                    <div className="font-bold text-slate-800">{project.overview.taskCounts.TODO}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div className="text-xs text-slate-500 mb-0.5">IN PROG</div>
                    <div className="font-bold text-slate-800">{project.overview.taskCounts.IN_PROGRESS}</div>
                  </div>
                  <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-center">
                    <div className="text-xs text-rose-600 mb-0.5">RISKS</div>
                    <div className="font-bold text-rose-700">{project.overview.openRiskCount}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <ConfirmForm 
                  action={async () => {
                    "use server";
                    await deleteProject(project._id);
                  }}
                  actionName="Xóa Project"
                  entityName={project.name}
                >
                  <button type="submit" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </ConfirmForm>
                <Link 
                  href={`/projects/${project._id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-semibold text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
                >
                  View Board <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FolderGit2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No projects yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Get started by creating your first project using the form above.</p>
          </div>
        )}
      </div>

    </div>
  );
}