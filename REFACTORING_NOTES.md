# 📝 TÀI LIỆU TÁI CẤU TRÚC TOÀN DIỆN & HƯỚNG DẪN AI AGENT (AL-TASK MASTER CONTEXT)

> **Dự án**: AL-TASK (Jira + Confluence Clone)  
> **Mục tiêu**: Tinh gọn hệ thống (Lean Architecture), loại bỏ overengineering (No Redis, No LiveKit, No Chat), tối ưu hóa hiệu năng, đạt chuẩn Portfolio Fresher/Junior Fullstack xuất sắc.  
> **Nhánh Git hiện tại**:
> - Root repository: `main`
> - `backend`: `feature/portfolio-lean-refactor`
> - `frontend`: `feature/portfolio-lean-refactor`

---

## 🧭 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC THIẾT KẾ (SYSTEM PHILOSOPHY)

### 1.1. Triết lý Lean Architecture (Zero-Overengineering)
Dự án được xây dựng và tái cấu trúc xoay quanh 2 nguyên tắc vàng trong kỹ nghệ phần mềm:
- **KISS (Keep It Simple, Stupid)** & **YAGNI (You Aren't Gonna Need It)**.
- **Tối đa hóa tài nguyên Single-Instance**: Thay vì vội vã đưa Redis Cluster hay Message Broker phân tán vào một ứng dụng chạy đơn node (gây lãng phí tài nguyên, tăng điểm lỗi hạ tầng và chi phí hosting), hệ thống tận dụng tối đa In-Memory Data Structures, Native Socket.IO Adapter, và MongoDB Compound Indexes.

### 1.2. Sơ đồ kiến trúc tổng thể (Architecture Diagram)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 15 Client (App Router)                       │
│  - React 19 + TanStack React Query + Zustand stores                    │
│  - Kanban Board (@dnd-kit, Optimistic UI + Error Rollback Toast)       │
│  - Confluence Wiki (TipTap Editor, 1.5s Debounced Auto-save)           │
│  - Bundle Optimization: next/dynamic splitting (Initial JS ~166kB)     │
│  - 1-Click Demo Login (Recruiter/Guest instant evaluation)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  HTTP REST (JSON)  │  WebSocket (WSS)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    NestJS 11 Monolithic Backend                        │
│  - Single-Instance Architecture (Port 5512 / .env)                     │
│  - Native In-Memory Socket.IO Adapter (No Redis Pub/Sub)               │
│  - In-Memory Sliding-Window Rate Limiting & Progressive Delay          │
│  - Strict Domain Event-Driven Realtime Propagation                     │
│  - Granular RBAC (WorkspaceRoleGuard: Owner, Admin, Member)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │  Mongoose ODM (Sub-50ms)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas Database Layer                         │
│  - Single $facet Aggregation Pipelines (Sub-30ms Dashboard)            │
│  - Bi-directional Linking: tasks.linkedPageIds ↔ pages.linkedTaskIds   │
│  - Compound Indexes:                                                   │
│      • tasks: { workspaceId: 1, status: 1, isDeleted: 1 }              │
│      • tasks: { workspaceId: 1, assigneeId: 1, isDeleted: 1 }          │
│      • pages: { workspaceId: 1, parentId: 1 }                          │
│      • pages: { workspaceId: 1, slug: 1 }                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 2. CHI TIẾT CÁC PHASE TÁI CẤU TRÚC ĐÃ HOÀN THÀNH (PHASE 0 - 6)

### 🟢 Phase 0: Baseline & Safety Verification
* **Git Isolation**: Tạo nhánh `feature/portfolio-lean-refactor` trên cả `backend` và `frontend`.
* **Baseline Build**: Xác minh mã nguồn gốc biên dịch sạch sẽ trước khi tiến hành can thiệp.

### 🟢 Phase 1: Loại bỏ Redis & Chuyển sang In-Memory Fallback
* **Gỡ bỏ thư viện**: `@socket.io/redis-adapter`, `cache-manager-redis-yet`, `redis`.
* **Socket.IO Native In-Memory Adapter**:
  - `backend/src/main.ts`: Cấu hình `app.useWebSocketAdapter(new IoAdapter(app));`.
  - Xóa bỏ `backend/src/infra/websocket/redis-socket-io.adapter.ts`.
* **In-Memory Cache**:
  - `backend/src/modules/cache/cache.module.ts`: Sử dụng `CacheModule.register({ isGlobal: true, ttl: 60000, max: 1000 })`.
* **In-Memory Rate Limiting & Progressive Delay**:
  - Viết lại `backend/src/modules/auth/security/login-attempt-throttle.service.ts` dùng cấu trúc In-Memory Sliding-Window (`Map`) thay thế Redis Lua script.
* **Dọn dẹp hạ tầng thừa**: Xóa `backend/src/infra/redis/`, xóa `backend/docker-compose.redis.yml`, dọn biến môi trường Redis.
* **Commit**: `6a5a9bd` (`feat(phase-1): remove redis, redis adapter, and configure in-memory fallback`).

### 🟢 Phase 2: Cắt gọt Module Chat & Video Call/Meeting (LiveKit)
* **Backend**:
  - Gỡ bỏ `livekit-server-sdk`.
  - Xóa `backend/src/modules/chat/`, `backend/src/modules/meetings/`, `socket-throttler.guard.ts`.
  - Tách rời dependencies: Gỡ `ChannelsService` khỏi `workspaces.service.ts`, gỡ bỏ `ChannelDocument` khỏi `attachment.service.ts` và `images.service.ts`.
  - Commits: `23a5642` & `68dda40`.
* **Frontend**:
  - Gỡ bỏ `@livekit/components-react`, `@livekit/components-styles`, `livekit-client`.
  - Xóa `modules/client/chat/`, `modules/client/meeting/`, `app/(client)/chat/`, `app/meeting/`, `stores/chatStore.ts`, `lib/socket/chat.client.ts`.
  - Cập nhật Sidebar navigation (Documents chuyển về đúng index `mainNav[5]`), Header, NotificationPanel. Giảm hơn **8,800 dòng code thừa**.
  - Commit: `8d91cb0` (`feat(phase-2): prune chat, meeting, and livekit from frontend`).

### 🟢 Phase 3: Hoàn thiện 5 Trụ cột cốt lõi
1. **Trụ cột 1: Workspace & Phân Quyền (RBAC)**:
   - Thắt chặt `delete()` trong `workspaces.service.ts`: Chỉ Workspace Owner hoặc SuperAdmin mới được quyền xóa workspace.
   - Bổ sung unit test kiểm tra ngoại lệ `ForbiddenException` khi user thường cố xóa workspace.
2. **Trụ cột 2: Jira Kanban Board (UX Realtime & Optimistic UI)**:
   - Kéo thả `@dnd-kit` mượt mà với rollback snapshot qua TanStack React Query trong `useDragHandlers.ts`.
   - Lắng nghe realtime sự kiện `task.updated` / `board:delta` qua WebSocket.
3. **Trụ cột 3: Confluence Wiki / Document Tree (Auto-save)**:
   - Quản lý cây tài liệu phân tầng `parentId`.
   - Bổ sung Auto-save debounced effect (1.5s) trong `OnlineDocumentEditorModal.tsx` kèm badge trạng thái (*"Saving..."* ➔ *"Saved at HH:mm"*).
4. **Trụ cột 4: Liên kết 2 chiều Task ↔ Document (Spotlight Feature)**:
   - **Schema**: Bổ sung indexed `linkedPageIds` trong `TaskSchema` và indexed `linkedTaskIds` trong `PageSchema`.
   - **Backend**: Xây dựng `TaskLinksService` và `TaskLinksController` hỗ trợ API liên kết 2 chiều. Test suites pass 100%.
   - **Frontend UI**:
     - `TaskLinkedPagesPanel`: Popover tìm kiếm & liên kết trang Confluence ngay trong màn hình Task Detail.
     - `PageLinkedTasksPanel`: Sidebar hiển thị các Jira tasks đang tham chiếu tài liệu này.
5. **Trụ cột 5: Dashboard Tối ưu hóa (MongoDB `$facet` Aggregation)**:
   - Refactor `dashboard.service.ts` từ 10+ câu query Mongoose riêng lẻ thành **1 pipeline `$facet` duy nhất**.
   - Tốc độ phản hồi đạt **sub-30ms** (<50ms).
* **Commits**: Backend `f691414`, Frontend `b137ee5`.

### 🟢 Phase 4: Tối ưu Database Compound Indexes & Bundle Size
1. **Compound Indexes**:
   - `TaskSchema`: `{ workspaceId: 1, status: 1, isDeleted: 1 }`, `{ workspaceId: 1, assigneeId: 1, isDeleted: 1 }`.
   - `PageSchema`: `{ workspaceId: 1, parentId: 1 }`, `{ workspaceId: 1, slug: 1 }`.
2. **Dynamic Imports TipTap**:
   - Áp dụng `next/dynamic` cho `TiptapEditor` và `OnlineDocumentEditorModal` (`DocsLayout.tsx`, `DocumentModals.tsx`, `ImportedDocumentViewer.tsx`).
   - First Load JS cho trang `/documents` giảm xuống còn **~166 kB**.

### 🟢 Phase 5: Bộ dữ liệu mẫu Portfolio & 1-Click Demo Login
1. **Script `pnpm run seed:portfolio`**:
   - Tạo 4 tài khoản kỹ sư mẫu: Alex Nguyen (Lead Fullstack), Sarah Jenkins (Senior Frontend), Michael Chen (Backend Architect), Emily Watson (QA Lead).
   - Tạo Workspace *"FinTech Core Platform"* (Key: `FIN`).
   - Tạo 24 Tasks thực tế phân bổ đồng đều qua các trạng thái (To Do, In Progress, Code Review, Done).
   - Tạo 6 trang tài liệu Confluence phân cấp cây (Architecture, Security & PCI-DSS, PRD Payment Gateway v2.4, Webhook Engine, Release Notes, Onboarding).
   - Thiết lập sẵn liên kết 2 chiều Task ↔ Document.
2. **Nút "1-Click Demo Login"**:
   - Thêm nút *"1-Click Demo Login (Recruiter / Guest)"* trên màn hình đăng nhập (`LoginForm.tsx`).
   - Tự động đăng nhập vào `demo@altask.dev` / `Demo@123456` với 1 click.
* **Commits**: Backend `803d834`, Frontend `fee4386`.

### 🟢 Phase 6: Triển khai Cloud & Tài liệu Portfolio
1. **Root README.md**: Soạn thảo [README.md](file:///c:/Hoclaptrinh/ThucTap2/AL-TASK/README.md) hoàn chỉnh theo chuẩn quốc tế, trình bày sơ đồ kiến trúc, bảng phân tích Trade-off Lean, hướng dẫn kiểm thử và triển khai Vercel + Render + MongoDB Atlas.
2. **Commit**: Root `290d1ce`.

---

## 📂 3. BẢN ĐỒ THƯ MỤC & CÁC FILE QUAN TRỌNG (CODEBASE MAP)

### 3.1. Backend (`backend/`)
```
backend/
├── scripts/
│   ├── seed-portfolio.ts              # Script seed 4 users, FIN workspace, 24 tasks, 6 pages, 2-way links
│   └── seed-admin.ts                  # Script tạo tài khoản Super Admin ban đầu
├── src/
│   ├── app.module.ts                  # Root NestJS module (Cache, Throttler, Mongoose)
│   ├── main.ts                        # Entry point: IoAdapter in-memory, validation pipe, swagger
│   ├── common/
│   │   ├── guards/
│   │   │   └── workspace-role.guard.ts # RBAC guard kiểm tra quyền Workspace
│   │   └── utils/
│   │       └── normalizeForSearch.ts   # Tiện ích bóc tách tiếng Việt không dấu & tokens tìm kiếm
│   └── modules/
│       ├── auth/                      # JWT, Credential login, In-memory delay policy
│       ├── workspaces/                # Workspace CRUD, thành viên, permissions
│       ├── tasks/                     # Task CRUD, DTOs, mappers, Schemas
│       │   ├── controllers/
│       │   │   └── task-links.controller.ts # API liên kết 2 chiều Task ↔ Page
│       │   ├── services/
│       │   │   ├── task-links.service.ts    # Logic liên kết 2 chiều
│       │   │   └── task-counter.service.ts  # Tăng atomic task sequence (FIN-1, FIN-2...)
│       │   └── schemas/
│       │       ├── task.schema.ts           # Task schema (linkedPageIds, compound indexes)
│       │       └── task-counter.schema.ts   # Counter schema
│       ├── pages/                     # Confluence documents
│       │   ├── services/pages.service.ts
│       │   └── schemas/page.schema.ts       # Page schema (linkedTaskIds, parentId, slug index)
│       ├── kanban/                    # Kanban Board & Columns
│       │   └── schemas/kanban-board.schema.ts
│       ├── workflows/                 # Agile workflow transitions & statuses
│       ├── dashboard/                 # Aggregated stats
│       │   └── services/dashboard.service.ts # Pipeline $facet tối ưu sub-30ms
│       └── realtime/                  # Socket.IO Gateway, Listeners
```

### 3.2. Frontend (`frontend/`)
```
frontend/
├── app/
│   ├── (auth)/login/page.tsx          # Màn hình đăng nhập
│   └── (client)/
│       ├── workspaces/[key]/[[...tab]]/page.tsx # Kanban board chính của workspace
│       ├── workspaces/[key]/pages/[slug]/page.tsx # Chi tiết trang tài liệu Confluence
│       └── documents/page.tsx         # Quản lý tài liệu Confluence
├── src/
│   ├── config/apiRoutes.ts            # Khai báo URL endpoints API
│   ├── modules/
│   │   ├── auth/login/components/LoginForm.tsx # Form đăng nhập + Nút 1-Click Demo Login
│   │   ├── workspace/
│   │   │   ├── shared/services/taskService.ts # Service gọi API tasks & task links
│   │   │   └── tasks/detail/
│   │   │       ├── TaskDetailMainContent.tsx
│   │   │       └── TaskLinkedPagesPanel.tsx   # Panel hiển thị & gán tài liệu vào Task
│   │   └── docs/
│   │       ├── components/
│   │       │   ├── DocsLayout.tsx             # Layout tài liệu (dynamic import TiptapEditor)
│   │       │   ├── DocumentModals.tsx         # Modal editor (dynamic import)
│   │       │   └── PageLinkedTasksPanel.tsx   # Panel hiển thị các task liên kết với Page
│   │       └── editor/
│   │           └── TiptapEditor.tsx           # Trình biên tập TipTap
```

---

## 🗄️ 4. SCHEMA & QUAN HỆ DỮ LIỆU CỐT LÕI (DATABASE CONTRACTS)

### 4.1. Liên kết 2 chiều Task ↔ Document (Two-Way Linking)
```typescript
// Task Schema (src/modules/tasks/schemas/task.schema.ts)
@Prop({ type: [{ type: Types.ObjectId, ref: 'Page' }], default: [], index: true })
linkedPageIds!: Types.ObjectId[];

// Page Schema (src/modules/pages/schemas/page.schema.ts)
@Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [], index: true })
linkedTaskIds!: Types.ObjectId[];
```
- Khi gọi `POST /tasks/:taskId/links/page`:
  - `task.linkedPageIds.addToSet(pageId)`
  - `page.linkedTaskIds.addToSet(taskId)`
- Khi gọi `DELETE /tasks/:taskId/links/page/:pageId`:
  - `task.linkedPageIds.pull(pageId)`
  - `page.linkedTaskIds.pull(taskId)`

### 4.2. API Endpoints mới phục vụ Liên kết 2 chiều
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/workspaces/:workspaceId/board/:taskId/links/pages` | Lấy danh sách trang Confluence liên kết với Task |
| `POST` | `/workspaces/:workspaceId/board/:taskId/links/pages` | Gán liên kết trang Confluence vào Task (`{ pageId }`) |
| `DELETE` | `/workspaces/:workspaceId/board/:taskId/links/pages/:pageId` | Gỡ liên kết trang Confluence khỏi Task |
| `POST` | `/tasks/:taskId/links/page` | Endpoint ngắn gọn gán liên kết (`{ pageId }`) |
| `DELETE` | `/tasks/:taskId/links/page/:pageId` | Endpoint ngắn gọn gỡ liên kết |
| `GET` | `/pages/:pageId/linked-tasks` | Lấy danh sách các Tasks đang tham chiếu trang tài liệu này |

### 4.3. Pipeline MongoDB Aggregation `$facet` (Dashboard)
Vị trí: `backend/src/modules/dashboard/services/dashboard.service.ts`
```typescript
const [result] = await this.taskModel.aggregate([
  { $match: { workspaceId: new Types.ObjectId(workspaceId), isDeleted: false } },
  {
    $facet: {
      statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      priorityCounts: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
      typeCounts: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
      assigneeCounts: [
        { $match: { assigneeId: { $ne: null } } },
        { $group: { _id: '$assigneeId', count: { $sum: 1 } } },
      ],
      userTasks: [
        { $match: { assigneeId: new Types.ObjectId(userId) } },
        { $sort: { updatedAt: -1 } },
        { $limit: 10 },
        { $project: { key: 1, title: 1, status: 1, priority: 1, dueDate: 1 } },
      ],
      totalStats: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          },
        },
      ],
    },
  },
]);
```

---

## ⚡ 5. DỮ LIỆU MẪU & TÀI KHOẢN DEMO (PORTFOLIO SEED)

Lệnh chạy khởi tạo dữ liệu mẫu:
```bash
pnpm --filter backend run seed:portfolio
```

### Thông tin tài khoản Demo:
- **Email**: `demo@altask.dev`
- **Mật khẩu**: `Demo@123456`
- **Vai trò**: Lead Fullstack Engineer / Workspace Owner
- **Workspace**: *FinTech Core Platform* (Key: `FIN`, Slug: `fintech-core-platform`)
- **Dữ liệu được seed sẵn**:
  - 4 Users: Alex Nguyen, Sarah Jenkins, Michael Chen, Emily Watson.
  - 24 Tasks thực tế bao quát đầy đủ 4 trạng thái:
    - 6 Tasks `To Do` (MFA, Bank edge cases, Burndown reports...)
    - 7 Tasks `In Progress` (Reconciliation, Swimlanes, Typing indicators...)
    - 4 Tasks `Code Review` (Audit logs, Bundle optimization, 2-way linking UI...)
    - 7 Tasks `Done` (Gateway architecture, Idempotent webhook, PCI-DSS tokenization...)
  - 6 Confluence Documents phân cấp hình cây:
    - `🏛️ Platform Architecture & Engineering Principles` (Root)
      - `🔐 Security, PCI-DSS & Data Encryption` (Child)
    - `📋 PRD - Payment Gateway Integration v2.4` (Root)
      - `⚡ Payment Webhook & Reconciliation Engine` (Child)
    - `🚀 Sprint 14 Release Notes & Deployment Playbook` (Root)
      - `🛠️ Developer Onboarding & Local Setup Guide` (Child)
  - Bi-directional Links: Tasks FIN-1, FIN-2, FIN-3, FIN-7, FIN-12 được gán sẵn với các tài liệu PRD & Architecture tương ứng.

---

## ⚠️ 6. NHỮNG LƯU Ý SỐNG CÒN KHI AI AGENT LÀM VIỆC TRÊN CODEBASE NÀY (GOTCHAS)

1. **Hệ điều hành Windows & Shell PowerShell**:
   - Khi chạy lệnh trong terminal, **tuyệt đối không dùng toán tử `&&`** (sẽ bị lỗi cú pháp PowerShell). Sử dụng dấu chấm phẩy `;` để ngăn cách câu lệnh:
     * *Đúng*: `pnpm run build; pnpm test`
     * *Sai*: `pnpm run build && pnpm test`
2. **Cấu trúc Git Submodules**:
   - `backend` và `frontend` là các submodule hoặc thư mục git độc lập. Khi tạo commit, cần `cd` vào từng repo tương ứng để commit và sau đó commit lại reference ở repo gốc nếu cần.
3. **UsersService trong Backend**:
   - `UsersService` cung cấp phương thức `getUserById(id: string)`, **không có phương thức `findById`**. Gọi `findById` sẽ gây lỗi biên dịch TypeScript.
4. **Mock Guard trong Unit Test NestJS**:
   - Khi viết unit test cho các Controller có gắn `@UseGuards(JwtAuthGuard)`, phải override guard trong module test:
     ```typescript
     Test.createTestingModule({...})
       .overrideGuard(JwtAuthGuard)
       .useValue({ canActivate: () => true })
       .compile();
     ```
     Nếu không override, NestJS Dependency Injection sẽ báo lỗi thiếu `JwtService`.
5. **Tiêu chuẩn kiểm thử (Strict 100% Pass Rate)**:
   - Toàn bộ backend test suite hiện có **54 test suites, 461 unit tests**.
   - Bất kỳ thay đổi nào làm giảm tỷ lệ pass khỏi **100%** đều bị coi là phá vỡ chất lượng phần mềm. Luôn kiểm tra lại bằng `pnpm test` trước khi kết thúc task.
6. **Next.js Dynamic Imports cho Editor**:
   - Các component chứa TipTap hoặc thư viện biên tập văn bản nặng bắt buộc phải bọc qua `dynamic(() => import(...), { ssr: false })` để tránh làm phình initial bundle load của ứng dụng.
