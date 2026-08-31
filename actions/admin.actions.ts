"use server";

import connectDB from "@/lib/mongo";
import Menu from "@/models/Menu";
import RolePermission from "@/models/RolePermission";
import { revalidatePath } from "next/cache";

// ---------------- MENU CRUD ----------------

export async function getMenus() {
  try {
    await connectDB();
    const menus = await Menu.find().sort({ order: 1 });
    return JSON.parse(JSON.stringify(menus));
  } catch (error) {
    console.error("Lỗi lấy danh sách menu:", error);
    return [];
  }
}

export async function createMenu(data: { name: string; path: string; icon: string; order: number }) {
  try {
    await connectDB();
    const menu = await Menu.create(data);
    
    // Automatically create default permissions for this new menu
    const roles = ['ADMIN', 'PM', 'MEMBER', 'VIEWER'];
    const perms = roles.map(role => ({
      role,
      menu_id: menu._id,
      can_read: role === 'ADMIN' || role === 'PM', // Default visible to ADMIN and PM
      can_create: role === 'ADMIN',
      can_update: role === 'ADMIN',
      can_delete: role === 'ADMIN',
    }));
    await RolePermission.insertMany(perms);

    revalidatePath("/admin");
    revalidatePath("/");
    return JSON.parse(JSON.stringify(menu));
  } catch (error) {
    console.error("Lỗi tạo menu:", error);
    throw new Error("Không thể tạo menu");
  }
}

export async function updateMenu(id: string, data: any) {
  try {
    await connectDB();
    const menu = await Menu.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/admin");
    revalidatePath("/");
    return JSON.parse(JSON.stringify(menu));
  } catch (error) {
    console.error("Lỗi cập nhật menu:", error);
    throw new Error("Không thể cập nhật menu");
  }
}

export async function deleteMenu(id: string) {
  try {
    await connectDB();
    await Menu.findByIdAndDelete(id);
    await RolePermission.deleteMany({ menu_id: id });
    revalidatePath("/admin");
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Lỗi xóa menu:", error);
    throw new Error("Không thể xóa menu");
  }
}

// ---------------- PERMISSIONS CRUD ----------------

export async function getRolePermissions() {
  try {
    await connectDB();
    const perms = await RolePermission.find().populate('menu_id');
    return JSON.parse(JSON.stringify(perms));
  } catch (error) {
    console.error("Lỗi lấy phân quyền:", error);
    return [];
  }
}

export async function getAuthorizedMenus(role: string) {
  try {
    await connectDB();
    const perms = await RolePermission.find({ role, can_read: true }).populate('menu_id');
    
    // Sort based on Menu's order
    const menus = perms.map(p => p.menu_id).filter(Boolean).sort((a: any, b: any) => a.order - b.order);
    return JSON.parse(JSON.stringify(menus));
  } catch (error) {
    console.error("Lỗi lấy menu theo role:", error);
    return [];
  }
}

export async function updatePermission(id: string, field: string, value: boolean) {
  try {
    await connectDB();
    const updateData = { [field]: value };
    await RolePermission.findByIdAndUpdate(id, updateData);
    revalidatePath("/admin");
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật phân quyền:", error);
    throw new Error("Không thể cập nhật phân quyền");
  }
}

export async function getPermissionsForPath(role: string, path: string) {
  try {
    await connectDB();
    const menu = await Menu.findOne({ path });
    // If no menu is explicitly registered for this path, we fallback to default true or false
    if (!menu) {
      return { can_read: true, can_create: true, can_update: true, can_delete: true };
    }
    const perm = await RolePermission.findOne({ role, menu_id: menu._id });
    if (!perm) {
      return { can_read: false, can_create: false, can_update: false, can_delete: false };
    }
    return JSON.parse(JSON.stringify(perm));
  } catch (error) {
    console.error("Lỗi lấy permission cho path:", error);
    return { can_read: false, can_create: false, can_update: false, can_delete: false };
  }
}
