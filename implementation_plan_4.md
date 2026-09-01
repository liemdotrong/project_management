# Phân loại Role & Hardcode Quyền Hạn (RBAC)

Dựa trên yêu cầu của bạn, hệ thống sẽ chuyển từ việc lưu phân quyền trong Database sang **Hardcode trực tiếp theo từng Role** (vì tính năng Role Permissions Matrix đã bị xóa).

## User Review Required
> [!IMPORTANT]
> Dưới đây là cách tôi hiểu và sẽ cài đặt logic cho từng Role. Hãy kiểm tra thật kỹ xem có đúng ý bạn chưa nhé:
> 
> 1. **ADMIN**: 
>    - **Admin Page**: Truy cập ĐẦY ĐỦ (Thêm, Xóa, Sửa User).
>    - **Kanban Board**: Chỉ được **XEM** (Read-Only). Không được thêm, xóa, hay kéo thả Task.
> 
> 2. **PM (Project Manager)**:
>    - **Admin Page**: Bị CHẶN (Access Denied).
>    - **Kanban Board**: Toàn quyền (Thêm, Xóa, Sửa Task, Kéo thả Task, Thêm Sub-tab).
> 
> 3. **MEMBER**:
>    - **Admin Page**: Bị CHẶN.
>    - **Kanban Board**: Được **XEM** Task. Được **THÊM** dữ liệu vào 4 Sub-tabs (Risk, Opportunity, Expenses, Documents).
>    - *(Xem phần Open Questions bên dưới về quyền sửa/kéo thả Task của Member)*
> 
> 4. **VIEWER**:
>    - **Admin Page**: Bị CHẶN.
>    - **Kanban Board**: Chỉ được **XEM** (Read-Only). Không làm được gì khác.

## Open Questions
> [!NOTE]
> Xin hãy phản hồi các câu hỏi sau trước khi tôi tiến hành code:
> 1. **ADMIN**: Có thật sự Admin *không được phép* Thêm/Sửa/Xóa Task trên Kanban không? (Chỉ được Xem như Viewer?).
> 2. **MEMBER**: Role này có được phép **Kéo thả Task (Move Task)** giữa các cột (To Do -> In Progress) và **Sửa thông tin Task** không? Hay họ CHỈ được phép thêm dữ liệu vào 4 Sub-tabs?

## Proposed Changes

### [MODIFY] [lib/permissions.ts](file:///d:/OneDrive/project_management/lib/permissions.ts)
- Viết lại toàn bộ logic kiểm tra quyền dựa trên 4 Roles cố định.
- Thêm các hàm helper: `canAccessAdmin(role)`, `getTaskPermissions(role)`, `getSubTabPermissions(role)`.

### [MODIFY] [app/admin/page.tsx](file:///d:/OneDrive/project_management/app/admin/page.tsx)
- Sử dụng hàm `canAccessAdmin(currentUser.role)` để chặn người dùng không phải ADMIN.

### [MODIFY] [app/page.tsx](file:///d:/OneDrive/project_management/app/page.tsx)
- Loại bỏ hàm fetch quyền từ DB (`getPermissionsForPath`).
- Thay thế bằng `getTaskPermissions(currentUser.role)`.
- Ẩn form "Create Issue" nếu role không có quyền tạo Task (VD: Admin, Member, Viewer).

### [MODIFY] [components/TaskDrawer.tsx](file:///d:/OneDrive/project_management/components/TaskDrawer.tsx)
- Áp dụng `getSubTabPermissions(currentUser.role)` để quyết định xem form Thêm Mới ở các tab (Expenses, Documents, Risks...) có được hiển thị hay không.

### [MODIFY] [components/KanbanBoard.tsx](file:///d:/OneDrive/project_management/components/KanbanBoard.tsx)
- Kiểm tra quyền `can_update_task` để cho phép / chặn thao tác kéo thả (Drag & Drop) Task.

## Verification Plan
1. Code các hàm kiểm tra phân quyền trung tâm tại `lib/permissions.ts`.
2. Gắn các hàm này vào Server Components (chặn truy cập trang) và Client Components (ẩn/hiện nút bấm).
3. Hướng dẫn bạn đăng nhập thử với từng Role để kiểm chứng.
