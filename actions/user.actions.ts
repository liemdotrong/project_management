"use server";

import connectDB from "@/lib/mongo";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function hashMD5(str: string) {
  return crypto.createHash('md5').update(str).digest('base64');
}

export async function getUsers() {
  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    return [];
  }
}

export async function createUser(data: { email: string; name: string; password?: string; role: string }) {
  try {
    await connectDB();
    
    // Hash password if provided
    let finalPassword = data.password;
    if (finalPassword) {
      finalPassword = hashMD5(finalPassword);
    } else {
      // Default password if none provided
      finalPassword = hashMD5("123456");
    }

    const user = await User.create({
      ...data,
      password: finalPassword
    });

    revalidatePath("/users");
    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    console.error("Lỗi tạo user:", error);
    if (error.code === 11000) {
      throw new Error("Email đã tồn tại");
    }
    throw new Error("Không thể tạo user");
  }
}

export async function updateUser(id: string, data: any) {
  try {
    await connectDB();
    
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = hashMD5(updateData.password);
    } else {
      // Don't update password if empty string was sent
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    revalidatePath("/users");
    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    console.error("Lỗi cập nhật user:", error);
    if (error.code === 11000) {
      throw new Error("Email đã tồn tại");
    }
    throw new Error("Không thể cập nhật user");
  }
}

export async function deleteUser(id: string) {
  try {
    await connectDB();
    await User.findByIdAndDelete(id);
    revalidatePath("/users");
    return true;
  } catch (error) {
    console.error("Lỗi xóa user:", error);
    throw new Error("Không thể xóa user");
  }
}
