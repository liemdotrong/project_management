"use server";

import connectDB from "@/lib/mongo";
import Expense from "@/models/Expense";
import Task from "@/models/Task";
import Risk from "@/models/Risk";
import { revalidatePath } from "next/cache";

export async function createExpense(taskId: string, category: string, amount: number, path: string) {
  try {
    await connectDB();
    
    const newExpense = await Expense.create({
      task_id: taskId,
      category,
      amount,
    });

    // Business Rule R1 (Chi phí vượt ngưỡng)
    // Nếu Sum(Task.Expenses) > Task.Budget, tạo Risk tự động loại "Budget Overrun".
    
    // Calculate total expenses for this task
    const allExpenses = await Expense.find({ task_id: taskId });
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const task = await Task.findById(taskId);
    if (task && totalExpenses > (task.budget || 0)) {
      // Check if a Budget Overrun risk already exists to avoid duplicates
      const existingRisk = await Risk.findOne({ 
        task_id: taskId, 
        title: "Budget Overrun" 
      });

      if (!existingRisk) {
        await Risk.create({
          task_id: taskId,
          title: "Budget Overrun",
          severity: 5,
          probability: 5,
          mitigation_plan: "Review and request additional budget or cut costs immediately.",
          status: 'OPEN'
        });
      }
    }

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newExpense));
  } catch (error) {
    console.error("Lỗi tạo expense:", error);
    throw new Error("Không thể tạo expense");
  }
}

export async function getExpensesByTask(taskId: string) {
  try {
    await connectDB();
    const expenses = await Expense.find({ task_id: taskId }).sort({ spent_at: -1 });
    return JSON.parse(JSON.stringify(expenses));
  } catch (error) {
    console.error("Lỗi lấy expenses:", error);
    return [];
  }
}
