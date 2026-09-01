import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Task from "@/models/Task";
import Risk from "@/models/Risk";
import ActivityLog from "@/models/ActivityLog";
import { logActivityWithSession } from "@/actions/activity.actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { target_column_id, new_position } = body;

    if (!target_column_id) {
      return NextResponse.json({ error: "Missing target_column_id" }, { status: 400 });
    }

    await connectDB();
    
    // Business Rule R2 (Điều kiện hoàn thành)
    // Một Task không thể chuyển sang Done nếu vẫn còn Risk ở trạng thái OPEN với severity >= 4.
    if (target_column_id === 'DONE') {
      const openHighRisks = await Risk.find({ 
        task_id: id, 
        status: 'OPEN', 
        severity: { $gte: 4 } 
      });
      
      if (openHighRisks.length > 0) {
        return NextResponse.json({ 
          error: "Cannot move to DONE. Task has OPEN risks with severity >= 4." 
        }, { status: 403 }); // 403 Forbidden
      }
    }

    // Update Task
    const updateData: any = { column_id: target_column_id };
    if (new_position !== undefined) {
      updateData.position = new_position;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await logActivityWithSession(id, 'MOVED_TASK', { moved_to_column: target_column_id });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("API Error moving task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
