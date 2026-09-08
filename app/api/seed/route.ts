import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("pm_session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const currentUser = JSON.parse(session.value);
    
    await connectDB();
    
    // Create 10 projects
    const statuses = ['ACTIVE', 'COMPLETED', 'ON_HOLD'];
    const columns = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const priorities = ['LOW', 'MED', 'HIGH', 'URGENT'];

    let projectsCreated = 0;
    let tasksCreated = 0;
    
    for (let i = 1; i <= 10; i++) {
      const project = await Project.create({
        name: `Sample Project ${i}`,
        code: `PRJ-${Date.now().toString().slice(-4)}-${i}`,
        description: `This is an auto-generated sample project number ${i}.`,
        budget: Math.floor(Math.random() * 50000) + 10000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        owner: currentUser._id,
        members: [{ user: currentUser._id, role: 'ADMIN' }]
      });
      projectsCreated++;
      
      // For each project, create 15 tasks
      const tasksToCreate = [];
      for (let j = 1; j <= 15; j++) {
        tasksToCreate.push({
          title: `Sample Task ${j} for ${project.code}`,
          description: `Detailed description for task ${j}.`,
          project: project._id,
          column_id: columns[Math.floor(Math.random() * columns.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          position: j * 1000,
          assignees: [currentUser._id],
          budget: Math.floor(Math.random() * 5000)
        });
      }
      await Task.insertMany(tasksToCreate);
      tasksCreated += 15;
    }

    return NextResponse.json({ 
      message: "Successfully seeded the database",
      projects: projectsCreated,
      tasks: tasksCreated
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
