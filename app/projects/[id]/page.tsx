import { getTasksByProject, createTask } from "@/actions/task.actions";
import { cookies } from "next/headers";
import KanbanBoard from "@/components/KanbanBoard";
import { getTaskPermissions, getSubTabPermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";
import ConfirmForm from "@/components/ConfirmForm";

export const dynamic = "force-dynamic";

export default async function ProjectKanbanPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const projectId = params.id;

  const cookieStore = await cookies();
  const session = cookieStore.get("pm_session");
  if (!session) {
    redirect("/login");
  }
  
  const currentUser = JSON.parse(session.value);
  const permissions = getTaskPermissions(currentUser.role);
  const subTabPermissions = getSubTabPermissions(currentUser.role);

  const tasks = await getTasksByProject(projectId);

  const handleCreateTask = async (formData: FormData) => {
    "use server";
    if (!permissions.can_create) return;
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const due_date = formData.get("due_date") as string;
    const budget = formData.get("budget") as string;

    if (!title || title.trim() === "") return;

    await createTask(
      projectId,
      title,
      description || "",
      "BACKLOG", // default column for advanced kanban
      priority || "MED",
      due_date ? new Date(due_date) : undefined,
      budget ? Number(budget) : 0
    );
  }

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <a href={`/?highlight=${projectId}`} className="p-2 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg shadow-sm transition-colors" title="Back to Projects">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Sprint</h1>
      </div>

      {/* Form thêm task (Collapsible) */}
      {permissions.can_create && (
      <details className="mb-6 group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <span className="text-lg leading-none mt-[-2px]">+</span>
            </div>
            Create Issue
          </div>
          <div className="text-xs text-slate-400 font-normal">
            <span className="group-open:hidden border border-slate-200 px-2 py-1 rounded bg-white">Expand</span>
            <span className="hidden group-open:block border border-slate-200 px-2 py-1 rounded bg-white">Collapse</span>
          </div>
        </summary>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <ConfirmForm action={handleCreateTask} actionName="Thêm Task" entityNameField="title">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Tên công việc (Bắt buộc)</label>
              <input
                type="text"
                name="title"
                placeholder="Ví dụ: Thiết kế giao diện"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Mô tả ngắn</label>
              <input
                type="text"
                name="description"
                placeholder="Chi tiết công việc..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Độ ưu tiên</label>
              <select 
                name="priority"
                defaultValue="MED"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MED">MED</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ngày đến hạn (Due Date)</label>
              <input
                type="date"
                name="due_date"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ngân sách ($)</label>
              <input
                type="number"
                name="budget"
                placeholder="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            </div>
            <div className="flex justify-end mt-4">
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                + Thêm Task
              </button>
            </div>
          </ConfirmForm>
        </div>
      </details>
      )}

      {/* Truyền dữ liệu xuống Client Component */}
      <div className="flex-1 min-h-0">
        <KanbanBoard initialTasks={tasks} projectId={projectId} permissions={permissions} subTabPermissions={subTabPermissions} />
      </div>
    </div>
  );
}
