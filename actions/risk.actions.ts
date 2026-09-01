"use server";

import connectDB from "@/lib/mongo";
import Risk from "@/models/Risk";
import { revalidatePath } from "next/cache";
import { logActivityWithSession } from "@/actions/activity.actions";

export async function createRisk(taskId: string, data: any, path: string) {
  try {
    await connectDB();
    const newRisk = await Risk.create({
      ...data, task_id: taskId,
      dulieurac: "chọt thử database với mode strict"
    });
    await logActivityWithSession(taskId, 'CREATED_RISK', { title: data.title });
    revalidatePath(path);
    return JSON.parse(JSON.stringify(newRisk));
  } catch (error) {
    console.error("Lỗi tạo risk:", error);
    throw new Error("Không thể tạo risk");
  }
}

export async function updateRisk(riskId: string, data: any, path: string) {
  try {
    await connectDB();
    const updated = await Risk.findByIdAndUpdate(riskId, data, { new: true });
    if (updated) {
      await logActivityWithSession(updated.task_id.toString(), 'UPDATED_RISK', { title: updated.title });
    }
    revalidatePath(path);
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error("Lỗi update risk:", error);
    throw new Error("Không thể update risk");
  }
}

export async function getRisksByTask(taskId: string) {
  try {
    await connectDB();
    const risks = await Risk.find({ task_id: taskId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(risks));
  } catch (error) {
    console.error("Lỗi lấy risks:", error);
    return [];
  }
}

export async function deleteRisk(riskId: string, path: string) {
  try {
    await connectDB();
    const deleted = await Risk.findByIdAndDelete(riskId);
    if (deleted) {
      await logActivityWithSession(deleted.task_id.toString(), 'DELETED_RISK', { title: deleted.title });
    }
    revalidatePath(path);
    return true;
  } catch (error) {
    console.error("Lỗi xóa risk:", error);
    throw new Error("Không thể xóa risk");
  }
}
