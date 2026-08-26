import { getAllTasks, createTask } from "@/actions/task.actions";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic"; // Bắt buộc render mới mỗi lần tải trang, tắt cache tĩnh

export default async function ProjectPage() {
  // Dùng ID Project thực tế mà user cung cấp
  const dummyProjectId = "3c7449a46537b47996dfbc3f"; 
  const tasks = await getAllTasks();

  // Server Action xử lý form thêm task
  const handleCreateTask = async (formData: FormData) => {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    if (!title || title.trim() === "") return;

    await createTask(
      dummyProjectId, 
      title, 
      description || ""
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Công việc</h1>
      </div>

      {/* Form thêm task thực tế */}
      <div className="mb-8 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Tạo công việc mới</h2>
        <form action={handleCreateTask} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            name="title" 
            placeholder="Tên công việc (Bắt buộc)..." 
            required 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input 
            type="text" 
            name="description" 
            placeholder="Mô tả ngắn..." 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
            + Thêm Task
          </button>
        </form>
      </div>

      {/* Truyền dữ liệu xuống Client Component */}
      <KanbanBoard initialTasks={tasks} projectId={dummyProjectId} />
    </div>
  );
}