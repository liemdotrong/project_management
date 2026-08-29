"use server";

import connectDB from "@/lib/mongo";
import Opportunity from "@/models/Opportunity";
import { revalidatePath } from "next/cache";

export async function createOpportunity(taskId: string, data: any, path: string) {
  try {
    await connectDB();
    const newOpp = await Opportunity.create({ ...data, task_id: taskId });
    revalidatePath(path);
    return JSON.parse(JSON.stringify(newOpp));
  } catch (error) {
    console.error("Lỗi tạo opp:", error);
    throw new Error("Không thể tạo opp");
  }
}

export async function getOpportunitiesByTask(taskId: string) {
  try {
    await connectDB();
    const opps = await Opportunity.find({ task_id: taskId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(opps));
  } catch (error) {
    console.error("Lỗi lấy opportunities:", error);
    return [];
  }
}
