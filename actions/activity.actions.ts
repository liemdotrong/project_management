"use server";

import connectDB from "@/lib/mongo";
import ActivityLog from "@/models/ActivityLog";

export async function createActivityLog(taskId: string, userId: string, action: string, details?: any) {
  try {
    await connectDB();
    const newLog = await ActivityLog.create({
      task_id: taskId,
      user_id: userId,
      action,
      details
    });
    return JSON.parse(JSON.stringify(newLog));
  } catch (error) {
    console.error("Lỗi tạo activity log:", error);
  }
}

import { cookies } from "next/headers";

export async function logActivityWithSession(taskId: string, action: string, details?: any) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("pm_session");
    const currentUser = session ? JSON.parse(session.value) : null;
    const userId = currentUser?._id;

    if (userId) {
      await createActivityLog(taskId, userId, action, details);
    }
  } catch (err) {
    console.error("Error reading session for activity log:", err);
  }
}

export async function getActivityLogsByTask(taskId: string) {
  try {
    await connectDB();
    const logs = await ActivityLog.find({ task_id: taskId })
      .populate("user_id", "name email")
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(logs));
  } catch (error) {
    console.error("Lỗi lấy activity logs:", error);
    return [];
  }
}
