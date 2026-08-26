"use server"; // Khai báo đây là các hàm chạy trên server

import connectDB from "@/lib/mongo";
import Task from "@/models/Task";
import { revalidatePath } from "next/cache";

// 1. CREATE: Tạo Task mới
export async function createTask(projectId: string, title: string, description: string) {
  try {
    await connectDB();
    const newTask = await Task.create({
      title,
      description,
      project: projectId,
    });
    
    revalidatePath("/"); // Refresh lại trang chủ ngay lập tức
    revalidatePath(`/projects/${projectId}`); // Refresh lại route project
    return JSON.parse(JSON.stringify(newTask));
  } catch (error) {
    console.error("Lỗi tạo task:", error);
    throw new Error("Không thể tạo task");
  }
}

// 2. READ: Lấy danh sách Task theo Project
export async function getTasksByProject(projectId: string) {
  try {
    await connectDB();
    const tasks = await Task.find({ project: projectId }).sort({ order: 1, createdAt: -1 });
    return JSON.parse(JSON.stringify(tasks));
  } catch (error) {
    console.error("Lỗi lấy task:", error);
    return [];
  }
}

// 3. UPDATE: Cập nhật trạng thái Task (Dành cho Kéo Thả - Drag & Drop)
export async function updateTaskStatus(taskId: string, newStatus: string, path: string) {
  try {
    await connectDB();
    
    // Chỉ chấp nhận các trạng thái hợp lệ
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(newStatus)) {
      throw new Error("Trạng thái không hợp lệ");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status: newStatus },
      { new: true }
    );

    revalidatePath("/"); // Update lại UI ở trang chủ
    revalidatePath(path); // Update lại UI ở route hiện tại
    return JSON.parse(JSON.stringify(updatedTask));
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    throw new Error("Không thể cập nhật trạng thái task");
  }
}

// 4. DELETE: Xóa Task
export async function deleteTask(taskId: string, path: string) {
  try {
    await connectDB();
    await Task.findByIdAndDelete(taskId);
    revalidatePath(path);
  } catch (error) {
    console.error("Lỗi xóa task:", error);
    throw new Error("Không thể xóa task");
  }
}

// 5. READ ALL: Lấy tất cả Task (Dùng cho trang chủ test)
export async function getAllTasks() {
  try {
    await connectDB();
    const tasks = await Task.find({}).sort({ order: 1, createdAt: -1 });
    return JSON.parse(JSON.stringify(tasks));
  } catch (error) {
    console.error("Lỗi lấy tất cả task:", error);
    return [];
  }
}