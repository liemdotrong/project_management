import { getTasksByProject, createTask } from "@/actions/task.actions";
import { cookies } from "next/headers";
import KanbanBoard from "@/components/KanbanBoard";
import { getTaskPermissions, getSubTabPermissions } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProjectPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("pm_session");
  const currentUser = session ? JSON.parse(session.value) : null;
  const permissions = currentUser ? getTaskPermissions(currentUser.role) : { can_read: false, can_create: false, can_update: false, can_delete: false, can_move: false };
  const subTabPermissions = currentUser ? getSubTabPermissions(currentUser.role) : { can_read: false, can_create: false, can_update: false, can_delete: false };

  // Use a valid dummy ObjectId format (24 hex characters)
  const dummyProjectId = "65a1234567890abcdef12345";
  const tasks = await getTasksByProject(dummyProjectId);

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
      dummyProjectId,
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
      <div className="flex justify-between items-center mb-6 shrink-0">
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
          <form action={handleCreateTask}>
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
            <div className="flex items-end">
              <button type="submit" className="w-full px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                Create Issue
              </button>
            </div>
          </div>
        </form>
        </div>
      </details>
      )}

      {/* Truyền dữ liệu xuống Client Component */}
      <div className="flex-1 min-h-0">
        <KanbanBoard initialTasks={tasks} projectId={dummyProjectId} permissions={permissions} subTabPermissions={subTabPermissions} />
      </div>
    </div>
  );
}