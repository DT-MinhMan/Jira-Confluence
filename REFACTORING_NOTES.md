# 📝 NHẬT KÝ TÁI CẤU TRÚC VÀ HƯỚNG DẪN THỰC THI (HANDOVER NOTES)
> **Dự án**: AL-TASK (Jira + Confluence Clone)  
> **Mục tiêu**: Tinh gọn hệ thống, loại bỏ overengineering, đạt chuẩn Portfolio Fresher Fullstack chất lượng cao.  
> **Nhánh Git hiện tại**: `feature/portfolio-lean-refactor` (trên cả `backend` và `frontend`).

---

## 📌 1. TỔNG QUAN NHỮNG GÌ ĐÃ HOÀN THÀNH (PHASE 0 - 2)

### 🟢 Phase 0: Baseline & Safety Verification
* **Git Isolation**: Tạo nhánh `feature/portfolio-lean-refactor` trên cả 2 repository `backend` và `frontend` để bảo vệ mã nguồn ban đầu.
* **Baseline Build**: Chạy build kiểm tra mã nguồn nguyên bản, đảm bảo 0 lỗi biên dịch trước khi refactor.

---

### 🟢 Phase 1: Loại bỏ hoàn toàn Redis & Hạ tầng thừa
* **Gỡ bỏ thư viện**:
  * Đã gỡ bỏ: `@socket.io/redis-adapter`, `cache-manager-redis-yet`, `redis`.
* **Socket.IO Native In-Memory Adapter**:
  * Cấu hình trong `backend/src/main.ts`:
    ```typescript
    app.useWebSocketAdapter(new IoAdapter(app));
    ```
  * Loại bỏ `src/infra/websocket/redis-socket-io.adapter.ts`.
* **In-Memory Cache**:
  * Chuyển đổi `backend/src/modules/cache/cache.module.ts` sang cache in-memory mặc định của NestJS (`CacheModule.register({ isGlobal: true, ttl: 60000, max: 1000 })`).
* **In-Memory Rate Limiting & Progressive Delay**:
  * Viết lại `backend/src/modules/auth/security/login-attempt-throttle.service.ts` dùng In-Memory sliding window và Map thay thế cho Redis Lua script.
  * Toàn bộ test suite bảo mật chạy pass 100%.
* **Xoá file hạ tầng thừa**:
  * Xoá thư mục `backend/src/infra/redis/`.
  * Xoá file `backend/docker-compose.redis.yml`.
  * Dọn dẹp biến môi trường Redis trong `backend/.env.example`.
* **Git Commit**: `6a5a9bd` (`feat(phase-1): remove redis, redis adapter, and configure in-memory fallback`).

---

### 🟢 Phase 2: Cắt gọt Module Chat & Video Call/Meeting (LiveKit)

#### Phía Backend:
* **Gỡ bỏ thư viện**: Gỡ bỏ `livekit-server-sdk`.
* **Xoá module**:
  * Xoá toàn bộ `backend/src/modules/chat/`.
  * Xoá toàn bộ `backend/src/modules/meetings/`.
  * Xoá `src/common/guards/socket-throttler.guard.ts`.
  * Xoá scripts seed stickers không còn dùng (`scripts/seed-stickers-from-json.ts`, `scripts/upload-stickers-to-cloudinary.ts`).
* **Tách rời dependencies liên quan (Decoupling)**:
  * `backend/src/modules/workspaces/services/workspaces.service.ts` & `workspaces.module.ts`: Gỡ bỏ `ChannelsService` và các references tạo kênh chat khi tạo workspace.
  * `backend/src/app.module.ts`: Gỡ bỏ `ChatModule` và `MeetingsModule`.
  * `backend/src/modules/attachments/services/attachment.service.ts`: Gỡ bỏ liên kết `ChannelDocument` (chỉ còn đính kèm file cho Task và Confluence Page).
  * `backend/src/modules/images/images.service.ts`: Gỡ bỏ liên kết channel images.
* **Sửa Unit Test Specs**:
  * Cập nhật constructor injection trong `workspace-avatar.service.spec.ts` và `attachment.service.spec.ts`.
* **Kết quả**: **52/52 test suites pass, 441/441 unit tests pass 100%**. `nest build` thành công rực rỡ với exit code 0.
* **Git Commits**: `23a5642` & `68dda40`.

#### Phía Frontend:
* **Gỡ bỏ thư viện**: Gỡ bỏ `@livekit/components-react`, `@livekit/components-styles`, `livekit-client`.
* **Xoá toàn bộ mã nguồn Chat & Meeting**:
  * Xoá thư mục `frontend/src/modules/client/chat/`.
  * Xoá thư mục `frontend/src/modules/client/meeting/`.
  * Xoá thư mục routes `frontend/app/(client)/chat/`.
  * Xoá thư mục routes `frontend/app/meeting/`.
  * Xoá Zustand store: `frontend/src/stores/chatStore.ts`.
  * Xoá Socket clients: `frontend/src/lib/socket/chat.client.ts` & `socket.chat.ts`.
* **Cập nhật Layout & Điều hướng (UI Clean)**:
  * `frontend/app/(client)/layout.tsx`: Bỏ `ChatRealtimeHandler`.
  * `frontend/src/modules/admin-shared/components/common/components/Sidebar.tsx`: Bỏ nút Chat, Chat Accordion, unread count và chuyển Documents về đúng index `mainNav[5]`.
  * `frontend/src/modules/workspace/shared/components/Header.tsx`: Bỏ Chat quick button và query kênh chat.
  * `frontend/src/modules/notifications/components/NotificationPanel.tsx`: Bỏ link routing điều hướng tới `/chat`.
  * `frontend/src/modules/auth/shared/hooks/useAuth.ts`: Bỏ `chatSocketClient.disconnect()`.
* **Kết quả**: Giảm hơn **8,800 dòng code dư thừa**. `next build` hoàn tất sạch sẽ, build thành công toàn bộ **30 static & dynamic routes** của ứng dụng.
* **Git Commit**: `8d91cb0` (`feat(phase-2): prune chat, meeting, and livekit from frontend`).

---

## 🧭 2. KIẾN TRÚC HIỆN TẠI (SYSTEM STATUS)

1. **Backend**:
   - Chạy Single-Instance NestJS port 5512 (hoặc cấu hình qua `.env`).
   - Kết nối trực tiếp MongoDB Atlas qua Mongoose.
   - Quản lý File Upload / Attachments qua Cloudinary Service.
   - Socket.IO Server dùng **Native In-Memory Adapter**. Các phòng socket hiện có:
     - `workspace:${workspaceId}`: Đồng bộ cập nhật workspace, danh sách thành viên.
     - `task:${taskId}`: Đồng bộ cập nhật chi tiết task, bình luận.
     - `user:${userId}`: Gửi thông báo trực tiếp cho cá nhân.
2. **Frontend**:
   - Next.js App Router (Client module trong `app/(client)/...`).
   - Quản lý trạng thái: TanStack React Query + Zustand stores (`useAuthStore`, `useWorkspaceStore`, `usePermissionStore`).
   - Kéo thả Kanban: `@dnd-kit` và `@hello-pangea/dnd`.
   - Biên tập văn bản Confluence: `@tiptap/react` + ProseMirror plugins.

---

## 📌 2. KẾT QUẢ TRIỂN KHAI HOÀN TẤT (PHASE 3 - 6)

### 🟢 Phase 3: Hoàn Thiện & Đánh Bóng 5 Trụ Cột Cốt Lõi
1. **Trụ cột 1: Workspace & Phân Quyền (RBAC)**:
   - Thắt chặt logic `delete()` trong `workspaces.service.ts`: Chỉ Workspace Owner hoặc Global Super Admin mới được phép xóa workspace.
   - Thêm unit test kiểm tra ngoại lệ `ForbiddenException` khi user thường cố tình xóa workspace.
2. **Trụ cột 2: Jira Kanban Board (UX Realtime & Optimistic UI)**:
   - Kéo thả mượt mà với `@dnd-kit`, rollback state khi gặp sự cố mạng trong `useDragHandlers.ts`.
   - Lắng nghe realtime sự kiện `task.updated` / `board:delta` qua WebSocket.
3. **Trụ cột 3: Confluence Wiki / Document Tree (Auto-save)**:
   - Cây thư mục tài liệu đa tầng hỗ trợ `parentId`.
   - Bổ sung Auto-save debounced effect (1.5s) trong `OnlineDocumentEditorModal.tsx` kèm badge trạng thái động (*"Đang lưu..."* ➔ *"Đã lưu lúc HH:mm"*).
4. **Trụ cột 4: Liên kết Task ↔ Confluence Document (Tính năng điểm nhấn)**:
   - **Database**: Thêm indexed `linkedPageIds` trong `TaskSchema` và indexed `linkedTaskIds` trong `PageSchema`.
   - **Backend**: Xây dựng `TaskLinksService` và `TaskLinksController` hỗ trợ các API `GET/POST/DELETE` liên kết 2 chiều. Test suite `task-links.service.spec.ts` & `task-links.controller.spec.ts` pass 100%.
   - **Frontend UI**:
     - `TaskLinkedPagesPanel`: Popover tìm kiếm & liên kết tài liệu Confluence ngay trong màn hình Task Detail.
     - `PageLinkedTasksPanel`: Sidebar hiển thị các Jira tasks đang tham chiếu đến trang tài liệu hiện tại.
5. **Trụ cột 5: Dashboard Tối Ưu Hóa (MongoDB `$facet` Aggregation)**:
   - Viết lại `dashboard.service.ts` thay thế 10+ câu truy vấn đơn lẻ bằng một pipeline `$facet` duy nhất.
   - Thời gian phản hồi API Dashboard giảm xuống **sub-30ms** (<50ms).

---

### 🟢 Phase 4: Tối Ưu Database Compound Indexes & Bundle Size
1. **Compound Indexes**:
   - `TaskSchema`: 
     - `{ workspaceId: 1, status: 1, isDeleted: 1 }`
     - `{ workspaceId: 1, assigneeId: 1, isDeleted: 1 }`
   - `PageSchema`:
     - `{ workspaceId: 1, parentId: 1 }`
     - `{ workspaceId: 1, slug: 1 }`
2. **Bundle Size & Dynamic Imports**:
   - Cấu hình `next/dynamic` cho `TiptapEditor` và `OnlineDocumentEditorModal` trong `DocsLayout.tsx`, `DocumentModals.tsx`, `ImportedDocumentViewer.tsx`.
   - Kích thước First Load JS cho trang `/documents` giảm xuống còn **~166 kB**.

---

### 🟢 Phase 5: Bộ Dữ Liệu Mẫu (Seed Script) & 1-Click Demo Login
1. **Seed Script Portfolio (`pnpm run seed:portfolio`)**:
   - Tự động khởi tạo 4 tài khoản kỹ sư thực tế (Lead Fullstack, Senior Frontend, Backend Architect, QA Lead).
   - Tạo Workspace *"FinTech Core Platform"* (Key: `FIN`).
   - Tạo 24 Tasks phân bổ đồng đều qua các trạng thái (To Do, In Progress, Code Review, Done) và các mức độ ưu tiên/loại task.
   - Tạo 6 trang tài liệu Confluence phân cấp hình cây (Architecture, Security & PCI-DSS, PRD Payment Gateway v2.4, Webhook Engine, Release Notes, Onboarding).
   - Thiết lập sẵn liên kết 2 chiều giữa Task và Document.
2. **1-Click Demo Login Button**:
   - Thêm nút *"1-Click Demo Login (Recruiter / Guest)"* trên màn hình đăng nhập (`LoginForm.tsx`).
   - Tự động điền tài khoản `demo@altask.dev` / `Demo@123456` và đăng nhập trực tiếp chỉ với 1 click.

---

### 🟢 Phase 6: Triển Khai Cloud & Hồ Sơ Portfolio
1. **Portfolio README.md**:
   - Viết toàn diện `README.md` tại thư mục gốc với sơ đồ kiến trúc hệ thống, bảng so sánh Trade-off Lean vs Overengineering, hướng dẫn cài đặt, tài khoản demo 1-click, hướng dẫn deploy Cloud (Vercel + Render + MongoDB Atlas).
2. **Kiểm tra chất lượng (Verification)**:
   - **Backend**: 54/54 test suites passed, 461/461 unit tests passed (100%).
   - **Backend Build**: `nest build` exit code 0.
   - **Frontend Build**: `next build` exit code 0 trên toàn bộ 30 routes.

---

## 🏆 TỔNG KẾT TRẠNG THÁI CUỐI CÙNG
- **Kiến trúc**: Tinh gọn, hiện đại, không phụ thuộc Redis, không overengineering, đạt chuẩn Portfolio Fullstack ấn tượng.
- **Tài khoản Demo**: `demo@altask.dev` / `Demo@123456` (Workspace `FIN`).
- **Lệnh chạy demo seed**: `pnpm --filter backend run seed:portfolio`.
