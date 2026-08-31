"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";
import TaskDrawer from "./TaskDrawer";
import { Filter, Search } from "lucide-react";

const COLUMNS = [
    { id: "BACKLOG", title: "Backlog" },
    { id: "TODO", title: "To Do", wipLimit: 10 },
    { id: "IN_PROGRESS", title: "In Progress", wipLimit: 5 },
    { id: "IN_REVIEW", title: "In Review", wipLimit: 3 },
    { id: "DONE", title: "Done" }
];

export default function KanbanBoard({ initialTasks, projectId, permissions }: { initialTasks: any[], projectId: string, permissions?: any }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [activeTask, setActiveTask] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    // Cấu hình Sensor để phân biệt click (mở drawer) và drag (kéo thả)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Yêu cầu di chuyển chuột 5px mới tính là kéo (drag), nếu < 5px thì tính là click
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (permissions && !permissions.can_update) return;
        const { active } = event;
        setActiveTask(tasks.find(t => t._id === active.id));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as string;
        const currentStatus = active.data.current?.currentStatus;

        if (currentStatus === newStatus) return;

        // 1. Optimistic Update
        const previousTasks = [...tasks];
        setTasks((prev) =>
            prev.map((task) =>
                task._id === taskId ? { ...task, column_id: newStatus } : task
            )
        );

        // 2. Server Action (Call API for rule checking)
        try {
            const res = await fetch(`/api/tasks/${taskId}/move`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_column_id: newStatus })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to move task");
            }
        } catch (error: any) {
            console.error("Lỗi cập nhật", error);
            alert(error.message); // Hiển thị lỗi (VD: Rule R2 vi phạm)
            setTasks(previousTasks); // Rollback
        }
    };

    // Lọc task theo search query
    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Filter Bar */}
            <div className="flex items-center gap-4 mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-200 shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            {/* Board */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4 flex-1 min-h-0 items-start">
                    {COLUMNS.map((col) => {
                        const colTasks = filteredTasks.filter((task) => task.column_id === col.id);
                        return (
                            <BoardColumn 
                                key={col.id} 
                                id={col.id} 
                                title={col.title}
                                count={colTasks.length}
                                wipLimit={col.wipLimit}
                            >
                                {colTasks.map((task) => (
                                    <TaskCard 
                                        key={task._id} 
                                        task={task} 
                                        onClick={() => setSelectedTask(task)} 
                                        permissions={permissions}
                                    />
                                ))}
                            </BoardColumn>
                        )
                    })}
                </div>
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} permissions={permissions} /> : null}
                </DragOverlay>
            </DndContext>

            <TaskDrawer 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                permissions={permissions}
            />
        </div>
    );
}