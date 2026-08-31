"use server";

import connectDB from "@/lib/mongo";
import Document from "@/models/Document";
import { revalidatePath } from "next/cache";

export async function uploadDocument(taskId: string, fileData: { name: string, size: number, data: string, type: string }, userId: string, path: string) {
  try {
    await connectDB();
    const newDoc = await Document.create({ 
      task_id: taskId,
      file_name: fileData.name,
      file_size: fileData.size,
      mime_type: fileData.type,
      file_data: fileData.data,
      uploaded_by: userId
    });
    
    // Set file_url to our new internal API route
    newDoc.file_url = `/api/documents/${newDoc._id}`;
    await newDoc.save();

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
