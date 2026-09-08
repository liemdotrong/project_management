"use server";

import connectDB from "@/lib/mongo";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Risk from "@/models/Risk";
import Expense from "@/models/Expense";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to get current user from session
async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("pm_session");
  if (!session) return null;
  return JSON.parse(session.value);
}

// 1. CREATE
export async function createProject(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const budget = formData.get("budget") as string;

    if (!name || !code) throw new Error("Missing required fields");

    await connectDB();
    const newProject = await Project.create({
      name,
      code,
      description,
      budget: budget ? Number(budget) : 0,
      owner: user._id,
      members: [{ user: user._id, role: 'ADMIN' }] // Add creator as ADMIN member
    });

    revalidatePath("/");
    return JSON.parse(JSON.stringify(newProject));
  } catch (error) {
    console.error("Lỗi tạo project:", error);
    throw new Error("Không thể tạo project");
  }
}

// 2. READ: Overview
export async function getProjectsOverview() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectDB();
    
    // Fetch all active projects (for demo purposes, all users can see all projects)
    // using $ne: 1 to ensure backwards compatibility with older documents that might not have isDeleted field
    const projects = await Project.find({
      isDeleted: { $ne: 1 }
    }).lean();

    const projectIds = projects.map(p => p._id);

    // Fetch all non-deleted tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds }, isDeleted: { $ne: 1 } }).lean();
    const taskIds = tasks.map(t => t._id);

    // Fetch all risks and expenses for these tasks
    const [risks, expenses] = await Promise.all([
      Risk.find({ task_id: { $in: taskIds } }).lean(),
      Expense.find({ task_id: { $in: taskIds } }).lean()
    ]);

    // Aggregate data per project
    const projectsWithOverview = projects.map(project => {
      const projectTasks = tasks.filter(t => String(t.project) === String(project._id));
      const projectTaskIds = projectTasks.map(t => String(t._id));
      
      const projectRisks = risks.filter(r => projectTaskIds.includes(String(r.task_id)));
      const projectExpenses = expenses.filter(e => projectTaskIds.includes(String(e.task_id)));

      // Task status counts
      const taskCounts = {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
        OTHER: 0
      };

      projectTasks.forEach(task => {
        if (task.column_id === 'TODO' || task.column_id === 'BACKLOG') taskCounts.TODO++;
        else if (task.column_id === 'IN_PROGRESS' || task.column_id === 'IN_REVIEW') taskCounts.IN_PROGRESS++;
        else if (task.column_id === 'DONE') taskCounts.DONE++;
        else taskCounts.OTHER++;
      });
      
      // Calculate used budget: For now, we sum the actual expenses logged on tasks
      // Alternatively, we could sum task.budget if expenses aren't fully utilized yet.
      // But Expense is more accurate for "used". We'll use sum of expenses.
      const usedBudget = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        ...project,
        overview: {
          taskCounts,
          totalTasks: projectTasks.length,
          usedBudget,
          riskCount: projectRisks.length,
          openRiskCount: projectRisks.filter(r => r.status === 'OPEN').length
        }
      };
    });

    return JSON.parse(JSON.stringify(projectsWithOverview));
  } catch (error) {
    console.error("Lỗi lấy projects overview:", error);
    return [];
  }
}

// 3. UPDATE
export async function updateProject(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const budget = formData.get("budget") as string;

    await connectDB();
    const updated = await Project.findByIdAndUpdate(id, {
      ...(name && { name }),
      ...(code && { code }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(budget && { budget: Number(budget) })
    }, { new: true });

    revalidatePath("/");
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error("Lỗi cập nhật project:", error);
    throw new Error("Không thể cập nhật project");
  }
}

// 4. DELETE
export async function deleteProject(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await connectDB();
    
    // Find all tasks of this project to soft-delete them too
    const tasks = await Task.find({ project: id }, '_id');
    const taskIds = tasks.map(t => t._id);

    await Promise.all([
      Project.findByIdAndUpdate(id, { isDeleted: 1 }),
      Task.updateMany({ project: id }, { isDeleted: 1 })
      // Keeping Risks and Expenses as they are since they are soft-deleted implicitly via Tasks
    ]);

    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Lỗi xóa project:", error);
    throw new Error("Không thể xóa project");
  }
}

// 5. ASSIGN
export async function assignProject(projectId: string, userId: string, role: string = 'MEMBER') {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");

    await connectDB();
    
    // Check if user is already a member
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Project not found");

    const existingMember = project.members.find((m: any) => String(m.user) === userId);
    
    if (existingMember) {
      existingMember.role = role;
    } else {
      project.members.push({ user: userId, role });
    }

    await project.save();
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Lỗi assign project:", error);
    throw new Error("Không thể assign project");
  }
}
