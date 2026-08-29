"use server";

import connectDB from "@/lib/mongo";
import Risk from "@/models/Risk";
import { revalidatePath } from "next/cache";

export async function createRisk(taskId: string, data: any, path: string) {
  try {
    await connectDB();
    const newRisk = await Risk.create({ ...data, task_id: taskId });
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
