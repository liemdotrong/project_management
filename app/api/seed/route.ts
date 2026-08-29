import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongo";
import Project from "@/models/Project";
import User from "@/models/User";
import Task from "@/models/Task";
import Risk from "@/models/Risk";
import Opportunity from "@/models/Opportunity";
import Expense from "@/models/Expense";
import Document from "@/models/Document";
import ActivityLog from "@/models/ActivityLog";

const DUMMY_PROJECT_ID = "65a1234567890abcdef12345";

export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Project.deleteMany({}),
      User.deleteMany({}),
      Task.deleteMany({}),
      Risk.deleteMany({}),
      Opportunity.deleteMany({}),
      Expense.deleteMany({}),
      Document.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    // 1. Create Users
    const users = await User.insertMany([
      { name: "Liem Do", email: "liem@example.com", role: "PM", avatar_url: "https://i.pravatar.cc/150?u=liem" },
      { name: "Alice Smith", email: "alice@example.com", role: "ADMIN", avatar_url: "https://i.pravatar.cc/150?u=alice" },
      { name: "Bob Jones", email: "bob@example.com", role: "MEMBER", avatar_url: "https://i.pravatar.cc/150?u=bob" },
      { name: "Charlie Davis", email: "charlie@example.com", role: "MEMBER", avatar_url: "https://i.pravatar.cc/150?u=charlie" },
      { name: "Diana Prince", email: "diana@example.com", role: "VIEWER", avatar_url: "https://i.pravatar.cc/150?u=diana" },
    ]);

    const userIds = users.map(u => u._id);

    // 2. Create Project
    const project = await Project.create({
      _id: new mongoose.Types.ObjectId(DUMMY_PROJECT_ID),
      name: "E-Commerce Platform Revamp",
      code: "EC-REVAMP",
      description: "Modernizing the entire e-commerce frontend and backend infrastructure.",
      budget: 150000,
      status: "ACTIVE",
      owner: userIds[0],
      members: users.map(u => ({ user: u._id, role: u.role }))
    });

    // 3. Create >50 Tasks
    const columns = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const priorities = ['LOW', 'MED', 'HIGH', 'URGENT'];
    
    const taskData = [];
    for (let i = 1; i <= 55; i++) {
      // Distribution logic
      let col = 'BACKLOG';
      if (i <= 10) col = 'DONE';
      else if (i <= 13) col = 'IN_REVIEW'; // Max 3
      else if (i <= 18) col = 'IN_PROGRESS'; // Max 5
      else if (i <= 28) col = 'TODO'; // Max 10
      
      const numAssignees = Math.floor(Math.random() * 3) + 1;
      const assignees = [...userIds].sort(() => 0.5 - Math.random()).slice(0, numAssignees);

      taskData.push({
        title: `Task EC-${i}: ${i % 2 === 0 ? 'Develop' : 'Design'} Feature ${i}`,
        description: `Detailed description for feature ${i}. Needs careful implementation and testing.`,
        column_id: col,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        project: project._id,
        position: i * 1000,
        assignees: assignees,
        budget: Math.floor(Math.random() * 5000) + 500, // $500 - $5500
        due_date: new Date(Date.now() + (Math.random() * 30 - 15) * 24 * 60 * 60 * 1000)
      });
    }

    const tasks = await Task.insertMany(taskData);

    // 4. Create Risks, Opportunities, Expenses, Documents for some tasks
    const risks = [];
    const opportunities = [];
    const expenses = [];
    const documents = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const isRisky = Math.random() > 0.6; // 40% chance of having a risk
      const hasOpportunity = Math.random() > 0.7; // 30% chance
      const hasExpenses = Math.random() > 0.4; // 60% chance
      const hasDocs = Math.random() > 0.5; // 50% chance

      if (isRisky) {
        risks.push({
          task_id: task._id,
          title: `Potential delay due to third-party API`,
          severity: Math.floor(Math.random() * 5) + 1,
          probability: Math.floor(Math.random() * 5) + 1,
          mitigation_plan: "Establish a fallback local cache.",
          status: Math.random() > 0.2 ? 'OPEN' : 'MITIGATED' // Mostly open
        });
      }

      if (hasOpportunity) {
        opportunities.push({
          task_id: task._id,
          title: `Automate testing to save time`,
          impact_value: Math.floor(Math.random() * 10000) + 1000,
          action_plan: "Write Cypress e2e tests.",
          status: 'IDENTIFIED'
        });
      }

      if (hasExpenses) {
        const numExpenses = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numExpenses; j++) {
          expenses.push({
            task_id: task._id,
            category: "Software License",
            amount: Math.floor(Math.random() * (task.budget / 2)) + 100, // Ensure some overruns happen randomly
          });
        }
      }

      if (hasDocs) {
        documents.push({
          task_id: task._id,
          file_name: `specification_v${i}.pdf`,
          file_url: `https://example.com/spec_v${i}.pdf`,
          file_size: Math.floor(Math.random() * 10000000) + 100000,
          uploaded_by: userIds[0]
        });
      }
    }

    await Risk.insertMany(risks);
    await Opportunity.insertMany(opportunities);
    await Expense.insertMany(expenses);
    await Document.insertMany(documents);

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully with 55 tasks and related entities.",
      counts: {
        users: users.length,
        projects: 1,
        tasks: tasks.length,
        risks: risks.length,
        opportunities: opportunities.length,
        expenses: expenses.length,
        documents: documents.length
      }
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
