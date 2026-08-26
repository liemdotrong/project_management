"use client";

import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";
import { updateTaskStatus } from "@/actions/task.actions";

const COLUMNS = [
    { id: "TODO", title: "Cần làm" },
    { id: "IN_PROGRESS", title: "Đang làm" },
    { id: "DONE", title: "Hoàn thành" }
];

export default function KanbanBoard({ initialTasks, projectId }: { initialTasks: any[], projectId: string }) {
    // Lưu state ở Client để thao tác kéo thả mượt mà (Optimistic Update)
    const [tasks, setTasks] = useState(initialTasks);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Nếu thả ra ngoài cột, không làm gì cả
        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as string;
        const currentStatus = active.data.current?.currentStatus;

        // Nếu thả vào cột cũ, không cần cập nhật
        if (currentStatus === newStatus) return;

        // 1. Cập nhật UI ngay lập tức (Optimistic Update)
        setTasks((prev) =>
            prev.map((task) =>
                task._id === taskId ? { ...task, status: newStatus } : task
            )
        );

        // 2. Gọi API/Server Action chạy ngầm
        try {
            await updateTaskStatus(taskId, newStatus, `/projects/${projectId}`);
        } catch (error) {
            console.error("Lỗi cập nhật", error);
            // Nếu lỗi, rollback lại state ban đầu (bạn có thể thêm toast thông báo lỗi ở đây)
            setTasks(initialTasks);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto p-4">
                {COLUMNS.map((col) => (
                    <BoardColumn key={col.id} id={col.id} title={col.title}>
                        {tasks
                            .filter((task) => task.status === col.id)
                            .map((task) => (
                                <TaskCard key={task._id} task={task} />
                            ))}
                    </BoardColumn>
                ))}
            </div>
        </DndContext>
    );
}