# Tính năng các màn hình con (Task Sub-screens)

Hoàn thiện các màn hình con trong `TaskDrawer` để có thể quản lý thực tế (thêm mới và hiển thị danh sách). Hiện tại các Collection (Model) trong MongoDB đã được tạo sẵn bao gồm `Risk`, `Opportunity`, `Document`, `Expense`, và `ActivityLog`. Nhiệm vụ bây giờ là xây dựng các Server Action để lấy dữ liệu (Fetch) và hoàn thiện giao diện Client cho các tính năng này.

## User Review Required

> [!IMPORTANT]
> - Các Collection models như `Risk.ts`, `Document.ts`, `Opportunity.ts`, `Expense.ts`, và `ActivityLog.ts` **đã có sẵn** trong dự án. Do đó tôi sẽ tập trung vào việc tạo các Server Action để tương tác với các Model này, và cập nhật UI. 
> - Vì chức năng Upload file thật (S3/Cloudinary) chưa được setup, tab **Documents** sẽ tạm dùng form nhập Tên file và kích thước (hoặc mock URL) để giả lập hành vi upload. Bạn có đồng ý với hướng xử lý này không?

## Proposed Changes

### Server Actions (Backend)

#### [MODIFY] `actions/risk.actions.ts`
- Thêm hàm `getRisksByTask(taskId: string)` để lấy danh sách rủi ro theo Task.

#### [MODIFY] `actions/opportunity.actions.ts`
- Thêm hàm `getOpportunitiesByTask(taskId: string)` để lấy danh sách cơ hội (opportunities).

#### [MODIFY] `actions/document.actions.ts`
- Thêm hàm `getDocumentsByTask(taskId: string)` để lấy danh sách tài liệu.

#### [NEW] `actions/activity.actions.ts`
- Tạo mới file này để xử lý `getActivityLogsByTask(taskId: string)` và `createActivityLog(...)`.

### Client UI (Frontend)

#### [MODIFY] `components/TaskDrawer.tsx`
- **Chung**: Thêm React `useEffect` (hoặc SWR/React Query nếu cần) vào từng tab component để fetch data từ các server actions vừa tạo.
- **RisksTab**: 
  - Thêm Form để tạo Risk (Title, Severity, Probability, Mitigation Plan).
  - Render danh sách các Risk dưới dạng bảng/list.
- **OpportunitiesTab**: 
  - Thêm Form để tạo Opportunity (Title, Value, Probability, v.v. - theo Schema).
  - Render danh sách Opportunities.
- **DocumentsTab**: 
  - Thêm form nhập tên file giả lập upload.
  - Render danh sách file đính kèm (File name, size, upload date).
- **ExpensesTab**: 
  - Đã có Form tạo chi phí. Cần tích hợp hàm `getExpensesByTask` để hiển thị danh sách chi phí thực tế (Category, Amount, Date) thay cho dòng chữ placeholder "Added expenses will be listed here".
- **ActivityLogTab**: 
  - Lấy dữ liệu và hiển thị danh sách lịch sử Audit Trail.

## Verification Plan
1. Mở bất kỳ một Task.
2. Click sang các tab: Risks, Opportunities, Expenses, Documents. Thử điền form và thêm mới dữ liệu.
3. Reload lại modal/tab để kiểm tra xem dữ liệu có lưu xuống DB và fetch lên thành công hay không.
4. Kiểm tra xem Activity Log có ghi nhận không (nếu có tích hợp hook).
