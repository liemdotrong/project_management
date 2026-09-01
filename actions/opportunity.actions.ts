"use server";

import connectDB from "@/lib/mongo";
import Opportunity from "@/models/Opportunity";
import { revalidatePath } from "next/cache";
import { logActivityWithSession } from "@/actions/activity.actions";

export async function createOpportunity(taskId: string, data: any, path: string) {
  try {
    await connectDB();
    const newOpp = await Opportunity.create({ ...data, task_id: taskId });
    await logActivityWithSession(taskId, 'CREATED_OPPORTUNITY', { title: data.title });
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

export async function updateOpportunity(oppId: string, data: any, path: string) {
  try {
    await connectDB();
    const updated = await Opportunity.findByIdAndUpdate(oppId, data, { new: true });
    if (updated) {
      await logActivityWithSession(updated.task_id.toString(), 'UPDATED_OPPORTUNITY', { title: updated.title });
    }
    revalidatePath(path);
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error("Lỗi update opportunity:", error);
    throw new Error("Không thể update opportunity");
  }
}

export async function deleteOpportunity(oppId: string, path: string) {
  try {
    await connectDB();
    const deleted = await Opportunity.findByIdAndDelete(oppId);
    if (deleted) {
      await logActivityWithSession(deleted.task_id.toString(), 'DELETED_OPPORTUNITY', { title: deleted.title });
    }
    revalidatePath(path);
    return true;
  } catch (error) {
    console.error("Lỗi xóa opportunity:", error);
    throw new Error("Không thể xóa opportunity");
  }
}
