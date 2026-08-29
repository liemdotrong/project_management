# Advanced Integrated Kanban System Implementation Plan

This plan details the steps required to implement the Advanced Integrated Kanban System as defined in the provided SRS.

## User Review Required

> [!WARNING]
> This is a massive feature that will require significant changes to the database schema, API routes, and the frontend UI.
> Please review the proposed changes, especially the data models and business rules, to ensure they align perfectly with your expectations before we proceed.

## Open Questions

1. **Database Strategy:** The current project uses Mongoose. Are we sticking with MongoDB/Mongoose, or do you prefer migrating to a relational database (e.g., PostgreSQL with Prisma) given the complex relationships (Expenses, Risks, Opportunities)? (Assuming Mongoose for this plan, but please confirm).
2. **WebSocket Syncing:** The SRS mentions "WebSocket syncing" for drag and drop. Do you want to set up a dedicated Socket.io/Pusher server, or is it sufficient to rely on optimistic UI updates and Next.js Server Actions with periodic polling or Server-Sent Events (SSE) for simplicity in the current Next.js environment?
3. **File Uploads (Documents):** For the Document entity (max 25MB), where should files be stored? Options include AWS S3, Vercel Blob, Cloudinary, or local storage. (Will plan for a generic mock implementation or Vercel Blob if not specified).
4. **Activity Log:** How should the audit trail (Activity Log) be stored? Should we create a separate `ActivityLog` collection in MongoDB to track changes for each task?

## Proposed Changes

---

### 1. Database Schema Models (Mongoose)

We will update and create new Mongoose schemas in the `models/` directory to match the Entity Relationship Model.

#### [MODIFY] [Project.ts](file:///d:/OneDrive/project_management/models/Project.ts)
- Add `code` (String, unique).
- Add `budget` (Number, default 0, min 0).
- Add `status` (Enum).
- Add `members` (Array of ObjectIds ref `User` with roles).

#### [MODIFY] [Task.ts](file:///d:/OneDrive/project_management/models/Task.ts)
- Update `column_id` (Enum: Backlog, To Do, In Progress, In Review, Done).
- Add `priority` (Enum: LOW, MED, HIGH, URGENT).
- Add `due_date` (Date).
- Add `position` (Number, for drag & drop ordering).
- Add `assignees` (Array of ObjectIds ref `User`).
- Add `budget` (Number) to support R1 (Expense vs Task Budget).

#### [MODIFY] [User.ts](file:///d:/OneDrive/project_management/models/User.ts)
- Add `avatar_url` (String).
- Add `role` (Enum: ADMIN, PM, MEMBER, VIEWER).

#### [NEW] `models/Risk.ts`
- `task_id` (ObjectId, ref `Task`).
- `title` (String).
- `severity` (Number 1-5).
- `probability` (Number 1-5).
- `mitigation_plan` (String).
- `status` (Enum: OPEN, MITIGATED).

#### [NEW] `models/Opportunity.ts`
- `task_id` (ObjectId, ref `Task`).
- `title` (String).
- `impact_value` (Number).
- `action_plan` (String).
- `status` (Enum: IDENTIFIED, REALIZED).

#### [NEW] `models/Document.ts`
- `task_id` (ObjectId, ref `Task`).
- `file_name` (String).
- `file_url` (String).
- `file_size` (Number, max 25MB).
- `uploaded_by` (ObjectId, ref `User`).

#### [NEW] `models/Expense.ts`
- `task_id` (ObjectId, ref `Task`).
- `category` (String).
- `amount` (Number).
- `currency` (String, default 'USD').
- `receipt_url` (String).
- `spent_at` (Date).

#### [NEW] `models/ActivityLog.ts` (Required for Tab Activity Log)
- `task_id` (ObjectId, ref `Task`).
- `user_id` (ObjectId, ref `User`).
- `action` (String - e.g., 'UPDATED_STATUS', 'ADDED_RISK').
- `details` (Object).
- `created_at` (Date).

---

### 2. API Routes & Server Actions

We will build Next.js API routes or Server Actions to handle CRUD operations and business logic.

#### [NEW] `app/api/tasks/[id]/move/route.ts`
- **Purpose**: Fulfill AC 01. Handle `PATCH` requests to move a task.
- **Logic**: Update `column_id` and `position`. Enforce Business Rule R2 (Cannot move to Done if OPEN Risk severity >= 4).

#### [MODIFY] `actions/task.actions.ts`
- Add functions to fetch task details with all related data (risks, opportunities, expenses, documents) for the Rollup Engine and Drawer.

#### [NEW] `actions/expense.actions.ts`
- Add function to create an expense.
- **Logic**: Enforce Business Rule R1 (If Sum(Task.Expenses) > Task.Budget, auto-create a Risk "Budget Overrun").

#### [NEW] `actions/risk.actions.ts`, `actions/opportunity.actions.ts`, `actions/document.actions.ts`
- CRUD operations for respective entities.

---

### 3. Frontend UI - Kanban Board & Task Cards

Implement the UI according to the "Rich Aesthetics" guidelines (vibrant colors, glassmorphism, modern typography).

#### [MODIFY] [KanbanBoard.tsx](file:///d:/OneDrive/project_management/components/KanbanBoard.tsx)
- Upgrade `dnd-kit` implementation for smoother drag & drop.
- Implement Optimistic UI updates.
- Add Filter Bar (Assignee, Risk Level, Attachments, Due Date) (AC 03).
- Define dynamic columns (Backlog, To Do, In Progress, In Review, Done) with WIP limits.

#### [MODIFY] [TaskCard.tsx](file:///d:/OneDrive/project_management/components/TaskCard.tsx)
- Redesign for a premium look.
- Implement **Rollup Engine** displays:
  - Risk Indicator (Red/Yellow/Green badge based on score).
  - Opportunity Badge (impact value).
  - Expense Progress Bar (Actual vs Budget).
  - Document Counter (warning icon if empty for "In Review").
  - User Avatars (overlapping circles).
- Add conditional red border for R1 (Budget Overrun).

---

### 4. Frontend UI - Task Detail Drawer

#### [NEW] `components/TaskDrawer.tsx`
- A sliding side-drawer component using Radix UI Dialog or similar.
- Implement 6 Tabs (Overview, Risks, Opportunities, Documents, Expenses, Activity Log).
- Use dynamic forms and data fetching for each tab.
- Implement markdown editor for the Overview description.
- Implement Expense addition form (AC 02 - auto update UI).

---

### 5. Utilities & Integration

#### [NEW] `lib/permissions.ts`
- Implement role-based access control (RBAC) checking functions based on the Permissions Matrix.

## Verification Plan

### Automated/Unit Tests
- Given the timeframe and scope, we will rely on strict TypeScript types, Zod schemas for API validation, and robust manual testing workflows. We can add basic Jest tests for business rules (R1, R2) if required.

### Manual Verification
1. **Drag and Drop**: Verify smooth dragging between columns and immediate UI updates (AC 01).
2. **Business Rule R1**: Add expenses to a task exceeding its budget; verify red border appears and an automated Risk is created.
3. **Business Rule R2**: Add an open risk with severity 4+ to a task; attempt to move it to "Done" and verify it is blocked.
4. **Rollups**: Verify Task Card badges correctly calculate and display aggregates.
5. **Drawer Tabs**: Test CRUD operations in all 6 tabs of the Task Detail Drawer.
6. **Filtering**: Verify the Filter Bar correctly filters tasks by multiple criteria (AC 03).
7. **Permissions**: Log in as different roles and verify UI elements (e.g., Edit Board, Add Expense) are disabled/hidden appropriately.
