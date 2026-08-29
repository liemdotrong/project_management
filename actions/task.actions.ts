"use server";

import connectDB from "@/lib/mongo";
import Task from "@/models/Task";
import Risk from "@/models/Risk";
import Opportunity from "@/models/Opportunity";
import Document from "@/models/Document";
import Expense from "@/models/Expense";
import ActivityLog from "@/models/ActivityLog";
import { revalidatePath } from "next/cache";

// 1. CREATE
export async function createTask(
  projectId: string, 
  title: string, 
  description: string, 
  column_id = 'TODO',
  priority = 'MED',
  due_date?: Date | null,
  budget = 0
) {
  try {
    await connectDB();
    const newTask = await Task.create({
      title,
      description,
      project: projectId,
      column_id,
      priority,
      due_date,
      budget,
    });
    
    await ActivityLog.create({
      task_id: newTask._id,
      user_id: newTask.assignees?.[0] || null, // Mock user for now if no assignees
      action: 'CREATED_TASK',
      details: { title }
    });

    revalidatePath("/"); 
    revalidatePath(`/projects/${projectId}`);
    return JSON.parse(JSON.stringify(newTask));
  } catch (error) {
    console.error("Lỗi tạo task:", error);
    throw new Error("Không thể tạo task");
  }
}

// 2. READ: Get tasks with Rollup Data
export async function getTasksByProject(projectId: string) {
  try {
    await connectDB();
    // Fetch raw tasks
    const tasks = await Task.find({ project: projectId }).sort({ position: 1, createdAt: -1 }).lean();
    
    // Manual Rollup (simpler than complex aggregation for now)
    const taskIds = tasks.map(t => t._id);
    
    const [risks, opportunities, expenses, documents] = await Promise.all([
      Risk.find({ task_id: { $in: taskIds } }).lean(),
      Opportunity.find({ task_id: { $in: taskIds } }).lean(),
      Expense.find({ task_id: { $in: taskIds } }).lean(),
      Document.find({ task_id: { $in: taskIds } }).lean()
    ]);

    const enrichedTasks = tasks.map(task => {
      const taskRisks = risks.filter(r => String(r.task_id) === String(task._id));
      const taskOpps = opportunities.filter(o => String(o.task_id) === String(task._id));
      const taskExps = expenses.filter(e => String(e.task_id) === String(task._id));
      const taskDocs = documents.filter(d => String(d.task_id) === String(task._id));

      const maxRiskScore = taskRisks.reduce((max, r) => Math.max(max, (r.severity * r.probability) || 0), 0);
      const totalOppValue = taskOpps.reduce((sum, o) => sum + (o.impact_value || 0), 0);
      const totalExpenses = taskExps.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      return {
        ...task,
        rollup: {
          maxRiskScore,
          totalOppValue,
          totalExpenses,
          documentCount: taskDocs.length,
          hasOpenHighRisk: taskRisks.some(r => r.status === 'OPEN' && r.severity >= 4)
        }
      };
    });

    return JSON.parse(JSON.stringify(enrichedTasks));
  } catch (error) {
    console.error("Lỗi lấy task:", error);
    return [];
  }
}

// 3. UPDATE: Handled by API route /api/tasks/[id]/move/route.ts for Drag & Drop
// We'll also add a basic update action for the Drawer
export async function updateTaskDetails(taskId: string, updateData: any, path: string) {
  try {
    await connectDB();
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    
    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedTask));
  } catch (error) {
    console.error("Lỗi update task details:", error);
    throw new Error("Không thể update task details");
  }
}

// 4. DELETE
export async function deleteTask(taskId: string, path: string) {
  try {
    await connectDB();
    await Task.findByIdAndDelete(taskId);
    await Promise.all([
      Risk.deleteMany({ task_id: taskId }),
      Opportunity.deleteMany({ task_id: taskId }),
      Expense.deleteMany({ task_id: taskId }),
      Document.deleteMany({ task_id: taskId }),
      ActivityLog.deleteMany({ task_id: taskId }),
    ]);
    revalidatePath(path);
  } catch (error) {
    console.error("Lỗi xóa task:", error);
    throw new Error("Không thể xóa task");
  }
}