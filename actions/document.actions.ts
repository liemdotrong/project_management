"use server";

import connectDB from "@/lib/mongo";
import Document from "@/models/Document";
import { revalidatePath } from "next/cache";

// Mock upload function (since we don't have S3/Blob setup yet)
export async function uploadDocument(taskId: string, fileData: { name: string, size: number, url: string }, userId: string, path: string) {
  try {
    await connectDB();
    const newDoc = await Document.create({ 
      task_id: taskId,
      file_name: fileData.name,
      file_size: fileData.size,
      file_url: fileData.url, // In reality, this would be uploaded to a bucket first
      uploaded_by: userId
    });
    revalidatePath(path);
    return JSON.parse(JSON.stringify(newDoc));
  } catch (error) {
    console.error("Lỗi upload doc:", error);
    throw new Error("Không thể upload doc");
  }
}

export async function getDocumentsByTask(taskId: string) {
  try {
    await connectDB();
    const docs = await Document.find({ task_id: taskId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(docs));
  } catch (error) {
    console.error("Lỗi lấy documents:", error);
    return [];
  }
}
