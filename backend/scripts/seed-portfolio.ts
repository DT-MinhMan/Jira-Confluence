import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import mongoose, { Types } from 'mongoose';
import { User, UserSchema } from '../src/modules/users/schemas/users.schema';
import { Workspace, WorkspaceSchema } from '../src/modules/workspaces/schemas/workspace.schema';
import { Board, BoardSchema } from '../src/modules/kanban/schemas/kanban-board.schema';
import { Workflow, WorkflowSchema } from '../src/modules/workflows/schemas/workflow.schema';
import { Label, LabelSchema } from '../src/modules/labels/schemas/label.schema';
import { Page, PageSchema } from '../src/modules/pages/schemas/page.schema';
import { Task, TaskSchema } from '../src/modules/tasks/schemas/task.schema';
import { TaskCounter, TaskCounterSchema } from '../src/modules/tasks/schemas/task-counter.schema';
import { GLOBAL_ROLES } from '../src/common/constants/global-role.constants';
import { SPACE_ROLES } from '../src/common/constants/space-role.constants';
import { normalizeForSearch } from '../src/common/utils/normalizeForSearch';

async function seedPortfolio() {
  const dbUri = process.env.DB_CONNECTION_STRING || process.env.MONGO_URI;
  if (!dbUri) {
    throw new Error('Missing DB_CONNECTION_STRING or MONGO_URI in environment variables');
  }

  console.log('🔄 Connecting to MongoDB for Portfolio Demo Seed...');
  await mongoose.connect(dbUri);
  console.log('✅ Connected to MongoDB successfully.');

  const UserModel = mongoose.model(User.name, UserSchema);
  const WorkspaceModel = mongoose.model(Workspace.name, WorkspaceSchema);
  const BoardModel = mongoose.model(Board.name, BoardSchema);
  const WorkflowModel = mongoose.model(Workflow.name, WorkflowSchema);
  const LabelModel = mongoose.model(Label.name, LabelSchema);
  const PageModel = mongoose.model(Page.name, PageSchema);
  const TaskModel = mongoose.model(Task.name, TaskSchema);
  const TaskCounterModel = mongoose.model(TaskCounter.name, TaskCounterSchema);

  const defaultPassword = 'Demo@123456';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  console.log('👤 Seeding Demo Users...');
  const usersData = [
    {
      email: 'demo@altask.dev',
      fullName: 'Alex Nguyen (Lead Fullstack)',
      role: GLOBAL_ROLES.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      status: 'active',
      password: hashedPassword,
    },
    {
      email: 'sarah.dev@altask.dev',
      fullName: 'Sarah Jenkins (Senior Frontend)',
      role: GLOBAL_ROLES.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      status: 'active',
      password: hashedPassword,
    },
    {
      email: 'michael.backend@altask.dev',
      fullName: 'Michael Chen (Backend Architect)',
      role: GLOBAL_ROLES.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      status: 'active',
      password: hashedPassword,
    },
    {
      email: 'emily.qa@altask.dev',
      fullName: 'Emily Watson (QA Automation Lead)',
      role: GLOBAL_ROLES.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      status: 'active',
      password: hashedPassword,
    },
  ];

  const seededUsers: Record<string, any> = {};
  for (const u of usersData) {
    const userDoc = await UserModel.findOneAndUpdate(
      { email: u.email },
      { $set: u },
      { new: true, upsert: true },
    );
    seededUsers[u.email] = userDoc;
    console.log(`   + User ready: ${u.email} (${u.fullName})`);
  }

  const demoUser = seededUsers['demo@altask.dev'];
  const sarahUser = seededUsers['sarah.dev@altask.dev'];
  const michaelUser = seededUsers['michael.backend@altask.dev'];
  const emilyUser = seededUsers['emily.qa@altask.dev'];

  const workspaceSlug = 'fintech-core-platform';
  const workspaceKey = 'FIN';

  console.log('🏢 Seeding Demo Workspace...');
  let workspace = await WorkspaceModel.findOne({ slug: workspaceSlug });

  const workspaceData = {
    name: 'FinTech Core Platform',
    slug: workspaceSlug,
    key: workspaceKey,
    description:
      'High-throughput banking and financial transaction engine. Features real-time payment reconciliation, PCI-DSS security compliance, and sub-50ms analytics dashboards.',
    ownerId: demoUser._id,
    type: 'kanban',
    access: 'public',
    status: 'active',
    members: [
      { userId: demoUser._id, role: SPACE_ROLES.WORKSPACE_ADMIN },
      { userId: sarahUser._id, role: SPACE_ROLES.MEMBER },
      { userId: michaelUser._id, role: SPACE_ROLES.MEMBER },
      { userId: emilyUser._id, role: SPACE_ROLES.MEMBER },
    ],
    settings: {
      enableEpics: true,
      enableEstimates: true,
    },
  };

  if (workspace) {
    await WorkspaceModel.updateOne({ _id: workspace._id }, { $set: workspaceData });
    console.log(`   + Workspace updated: ${workspace.name} (${workspaceKey})`);
  } else {
    workspace = await WorkspaceModel.create(workspaceData);
    console.log(`   + Workspace created: ${workspace.name} (${workspaceKey})`);
  }

  const workspaceId = workspace._id;

  console.log('📊 Seeding Kanban Board & Workflow...');
  const boardColumns = [
    { id: 'todo', name: 'To Do', order: 0, mappedStatuses: ['todo'], isDone: false },
    { id: 'inprogress', name: 'In Progress', order: 1, mappedStatuses: ['inprogress'], isDone: false },
    { id: 'review', name: 'Code Review', order: 2, mappedStatuses: ['review'], isDone: false },
    { id: 'done', name: 'Done', order: 3, mappedStatuses: ['done'], isDone: true },
  ];

  await BoardModel.findOneAndUpdate(
    { workspaceId },
    {
      $set: {
        workspaceId,
        name: 'FinTech Kanban Board',
        columns: boardColumns,
        settings: {
          wipEnabled: false,
          swimlaneEnabled: false,
          estimationEnabled: true,
        },
      },
    },
    { upsert: true, new: true },
  );

  const workflowStatuses = [
    { id: 'todo', name: 'To Do', color: '#64748b', category: 'todo' },
    { id: 'inprogress', name: 'In Progress', color: '#f59e0b', category: 'inprogress' },
    { id: 'review', name: 'Code Review', color: '#3b82f6', category: 'inprogress' },
    { id: 'done', name: 'Done', color: '#10b981', category: 'done' },
  ];

  await WorkflowModel.findOneAndUpdate(
    { workspaceId },
    {
      $set: {
        workspaceId,
        name: 'FinTech Standard Agile Workflow',
        defaultStatus: 'todo',
        statuses: workflowStatuses,
        transitions: [
          { fromStatus: 'todo', toStatus: 'inprogress', name: 'Start Work' },
          { fromStatus: 'inprogress', toStatus: 'review', name: 'Submit for Review' },
          { fromStatus: 'review', toStatus: 'inprogress', name: 'Request Changes' },
          { fromStatus: 'review', toStatus: 'done', name: 'Approve & Merge' },
          { fromStatus: 'done', toStatus: 'inprogress', name: 'Reopen' },
        ],
      },
    },
    { upsert: true, new: true },
  );

  console.log('🏷️ Seeding Labels...');
  const labelNames = ['backend', 'frontend', 'security', 'payments', 'devops', 'compliance'];
  const seededLabels: Record<string, any> = {};

  for (const name of labelNames) {
    const label = await LabelModel.findOneAndUpdate(
      { workspaceId, normalizedName: name.toLowerCase() },
      {
        $set: {
          workspaceId,
          name,
          normalizedName: name.toLowerCase(),
          createdBy: demoUser._id,
          isDeleted: false,
        },
      },
      { upsert: true, new: true },
    );
    seededLabels[name] = label;
  }

  console.log('📚 Seeding Confluence Wiki Tree Pages...');
  // Clean old demo pages for this workspace to avoid duplicates
  await PageModel.deleteMany({ workspaceId });

  // Page 1: Root Architecture
  const page1 = await PageModel.create({
    workspaceId,
    title: '🏛️ Platform Architecture & Engineering Principles',
    slug: 'platform-architecture-engineering-principles',
    authorId: demoUser._id,
    lastEditedBy: demoUser._id,
    version: 1,
    content: `
<h1>🏛️ FinTech Platform Architecture Overview</h1>
<p>This document establishes the high-level architecture, zero-overengineering philosophy, and data processing standards for the FinTech Core Platform.</p>
<h2>1. Core Tenets</h2>
<ul>
  <li><strong>Single-Instance Lean Backend</strong>: NestJS monolithic service optimized for ultra-low latency without distributed cache bottlenecks.</li>
  <li><strong>Sub-50ms Analytics</strong>: High-efficiency MongoDB <code>$facet</code> aggregation pipelines eliminating N+1 queries.</li>
  <li><strong>Event-Driven Internal Realtime</strong>: In-memory WebSocket communication using native Socket.IO adapters.</li>
</ul>
<h2>2. Service Boundary Diagram</h2>
<pre><code>[Next.js 15 Client] ──(HTTP/REST + WSS)──> [NestJS Core Engine] ──(Mongoose)──> [MongoDB Atlas M0]
                                                  │
                                            (Cloudinary)
                                                  │
                                                  ▼
                                          [Asset Storage]</code></pre>
    `.trim(),
    labels: ['architecture', 'backend'],
    versionHistory: [
      { editedBy: demoUser._id, editedAt: new Date(), changes: 'Initial architectural specification' },
    ],
  });

  // Page 2: Child of Page 1 - Security
  const page2 = await PageModel.create({
    workspaceId,
    parentId: page1._id,
    title: '🔐 Security, PCI-DSS & Data Encryption',
    slug: 'security-pci-dss-data-encryption',
    authorId: michaelUser._id,
    lastEditedBy: michaelUser._id,
    version: 1,
    content: `
<h1>🔐 Security and PCI-DSS Compliance Guidelines</h1>
<p>All engineers handling cardholder data or sensitive transactions must comply with these encryption standards.</p>
<h2>1. Cryptographic Safeguards</h2>
<ul>
  <li><strong>In-Transit</strong>: TLS 1.3 mandatory on all endpoints. HSTS enabled with 1-year preload.</li>
  <li><strong>At-Rest</strong>: AES-256 GCM encryption for user PII and tokenized bank accounts.</li>
  <li><strong>Key Management</strong>: Secret rotation every 90 days via environment vaults.</li>
</ul>
<h2>2. Progressive Delay & Brute-Force Defense</h2>
<p>The authentication system utilizes sliding-window in-memory rate limiting with progressive retry delays to mitigate credential stuffing attacks.</p>
    `.trim(),
    labels: ['security', 'compliance'],
  });

  // Page 3: Root PRD - Payment Gateway
  const page3 = await PageModel.create({
    workspaceId,
    title: '📋 PRD - Payment Gateway Integration v2.4',
    slug: 'prd-payment-gateway-integration-v2-4',
    authorId: demoUser._id,
    lastEditedBy: sarahUser._id,
    version: 2,
    content: `
<h1>📋 Product Requirements: Payment Gateway Integration v2.4</h1>
<p><strong>Status:</strong> Approved | <strong>Target Release:</strong> Q3 Sprint 14</p>
<h2>1. Objective</h2>
<p>Seamlessly process card transactions, bank transfers, and e-wallets with an idempotency guarantee and sub-200ms SLA.</p>
<h2>2. Key Functional Requirements</h2>
<ol>
  <li><strong>Idempotency Keys</strong>: Every charge request must include a UUID v4 <code>X-Idempotency-Key</code> header cached for 24 hours.</li>
  <li><strong>Webhook Processing</strong>: Asynchronous retry with exponential backoff (1s, 5s, 30s, 2m, 10m).</li>
  <li><strong>Automated Reconciliation</strong>: Nightly settlement verification against bank settlement CSV feeds.</li>
</ol>
<h2>3. Success Metrics</h2>
<p>99.99% transaction success rate, zero duplicated charges, p99 latency &lt; 150ms.</p>
    `.trim(),
    labels: ['payments', 'prd'],
  });

  // Page 4: Child of Page 3 - Webhook Engine
  const page4 = await PageModel.create({
    workspaceId,
    parentId: page3._id,
    title: '⚡ Payment Webhook & Reconciliation Engine',
    slug: 'payment-webhook-reconciliation-engine',
    authorId: michaelUser._id,
    lastEditedBy: michaelUser._id,
    version: 1,
    content: `
<h1>⚡ Payment Webhook & Reconciliation Engine Spec</h1>
<p>Technical implementation details for handling incoming asynchronous payment notifications from banking partners.</p>
<h2>Webhook Verification Flow</h2>
<pre><code>Inbound Request ➔ HMAC SHA-256 Signature Verification ➔ Idempotency Check ➔ Event Dispatch ➔ ACK 200 OK</code></pre>
<p>If downstream ledger processing fails, the task is enqueued with immediate dead-letter-queue logging and alert dispatching.</p>
    `.trim(),
    labels: ['payments', 'backend'],
  });

  // Page 5: Root Release Notes
  const page5 = await PageModel.create({
    workspaceId,
    title: '🚀 Sprint 14 Release Notes & Deployment Playbook',
    slug: 'sprint-14-release-notes-deployment-playbook',
    authorId: emilyUser._id,
    lastEditedBy: demoUser._id,
    version: 1,
    content: `
<h1>🚀 Sprint 14 Release Notes & Deployment Playbook</h1>
<p>Comprehensive deployment guide and QA validation checklist for production release.</p>
<h2>Release Highlights</h2>
<ul>
  <li>✅ Completed two-way linking between Jira tasks and Confluence documentation.</li>
  <li>✅ Optimized workspace dashboard with MongoDB <code>$facet</code> single aggregation query (&lt;30ms response).</li>
  <li>✅ Eliminated Redis dependency in favor of native in-memory adapters and sliding windows.</li>
  <li>✅ Upgraded TipTap editor auto-save debounce with dynamic status badge indicators.</li>
</ul>
<h2>Pre-Flight Verification</h2>
<p>Run test suite with <code>pnpm test</code> ensuring 100% test pass rate across all 54 test suites (461 tests).</p>
    `.trim(),
    labels: ['devops', 'qa'],
  });

  // Page 6: Child of Page 5 - Onboarding Guide
  const page6 = await PageModel.create({
    workspaceId,
    parentId: page5._id,
    title: '🛠️ Developer Onboarding & Local Setup Guide',
    slug: 'developer-onboarding-local-setup-guide',
    authorId: sarahUser._id,
    lastEditedBy: sarahUser._id,
    version: 1,
    content: `
<h1>🛠️ Developer Onboarding Guide</h1>
<p>Welcome to the engineering team! Here is how to run the entire stack locally in 2 minutes:</p>
<pre><code># 1. Install dependencies
pnpm install

# 2. Run MongoDB & Backend
pnpm --filter backend start:dev

# 3. Run Next.js 15 Client
pnpm --filter frontend dev

# 4. Seed Portfolio Demo Data
pnpm --filter backend run seed:portfolio</code></pre>
    `.trim(),
    labels: ['frontend', 'onboarding'],
  });

  console.log('   + Confluence pages created with hierarchical structure.');

  console.log('🎯 Seeding 24 Realistic Kanban Tasks...');
  // Clean old demo tasks for this workspace
  await TaskModel.deleteMany({ workspaceId });

  const tasksRaw = [
    // --- DONE (7 tasks) ---
    {
      key: `${workspaceKey}-1`,
      title: 'Design resilient payment gateway integration architecture',
      description: 'Draft end-to-end architecture covering idempotency, signature validation, and fault-tolerant webhook ingestion.',
      status: 'done',
      columnId: 'done',
      type: 'epic',
      priority: 'highest',
      assigneeId: demoUser._id,
      reporterId: demoUser._id,
      storyPoints: 8,
      timeEstimated: 16,
      timeLogged: 16,
      linkedPageIds: [page1._id, page3._id],
      labelIds: [seededLabels['backend']._id, seededLabels['payments']._id],
    },
    {
      key: `${workspaceKey}-2`,
      title: 'Implement idempotent webhook ingestion pipeline',
      description: 'Ensure incoming webhook events are deduplicated using MongoDB compound index on provider transaction id.',
      status: 'done',
      columnId: 'done',
      type: 'story',
      priority: 'high',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 12,
      timeLogged: 12,
      linkedPageIds: [page4._id],
      labelIds: [seededLabels['backend']._id, seededLabels['payments']._id],
    },
    {
      key: `${workspaceKey}-3`,
      title: 'Add PCI-DSS compliant credit card tokenization',
      description: 'Integrate client-side field encryption so plain text credit card numbers never touch the application server.',
      status: 'done',
      columnId: 'done',
      type: 'story',
      priority: 'highest',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 10,
      timeLogged: 10,
      linkedPageIds: [page2._id],
      labelIds: [seededLabels['security']._id, seededLabels['compliance']._id],
    },
    {
      key: `${workspaceKey}-4`,
      title: 'Refactor login rate limiter to in-memory sliding window',
      description: 'Replaced Redis Lua rate-limiting script with progressive delay in-memory Map policy, reducing memory footprint by 80%.',
      status: 'done',
      columnId: 'done',
      type: 'task',
      priority: 'high',
      assigneeId: demoUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 6,
      timeLogged: 6,
      linkedPageIds: [page1._id],
      labelIds: [seededLabels['backend']._id, seededLabels['security']._id],
    },
    {
      key: `${workspaceKey}-5`,
      title: 'TipTap document editor auto-save with debounce badge',
      description: 'Added 1.5s debounced autosave effect with dynamic badge status (Saving... -> Saved at HH:mm).',
      status: 'done',
      columnId: 'done',
      type: 'story',
      priority: 'medium',
      assigneeId: sarahUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 8,
      timeLogged: 8,
      linkedPageIds: [page5._id],
      labelIds: [seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-6`,
      title: 'Fix optimistic drag-and-drop rollback glitch on network error',
      description: 'Handled error rollback using React Query setQueryData snapshots in KanbanBoard handler.',
      status: 'done',
      columnId: 'done',
      type: 'bug',
      priority: 'high',
      assigneeId: sarahUser._id,
      reporterId: emilyUser._id,
      storyPoints: 2,
      timeEstimated: 4,
      timeLogged: 4,
      linkedPageIds: [],
      labelIds: [seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-7`,
      title: 'Setup automated QA regression suite for core flows',
      description: 'Created 461 unit and integration test specs covering authentication, workspaces, tasks, and documentation.',
      status: 'done',
      columnId: 'done',
      type: 'task',
      priority: 'medium',
      assigneeId: emilyUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 14,
      timeLogged: 14,
      linkedPageIds: [page5._id, page6._id],
      labelIds: [seededLabels['devops']._id],
    },

    // --- CODE REVIEW (4 tasks) ---
    {
      key: `${workspaceKey}-8`,
      title: 'Audit log event publisher for sensitive financial transactions',
      description: 'Emit structured domain audit events when workspace permissions change or payments get authorized.',
      status: 'review',
      columnId: 'review',
      type: 'story',
      priority: 'high',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 8,
      timeLogged: 6,
      linkedPageIds: [page2._id],
      labelIds: [seededLabels['backend']._id, seededLabels['security']._id],
    },
    {
      key: `${workspaceKey}-9`,
      title: 'Optimize Next.js initial bundle with dynamic editor imports',
      description: 'Split TipTap and heavy markdown plugins using next/dynamic to drop initial load JS down to ~166kB.',
      status: 'review',
      columnId: 'review',
      type: 'task',
      priority: 'medium',
      assigneeId: sarahUser._id,
      reporterId: demoUser._id,
      storyPoints: 2,
      timeEstimated: 5,
      timeLogged: 4,
      linkedPageIds: [page5._id],
      labelIds: [seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-10`,
      title: 'Two-way Task <-> Confluence Document linking UI panels',
      description: 'Implement TaskLinkedPagesPanel and PageLinkedTasksPanel with search popovers and bidirectional synchronization.',
      status: 'review',
      columnId: 'review',
      type: 'story',
      priority: 'highest',
      assigneeId: sarahUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 12,
      timeLogged: 10,
      linkedPageIds: [page3._id],
      labelIds: [seededLabels['frontend']._id, seededLabels['backend']._id],
    },
    {
      key: `${workspaceKey}-11`,
      title: 'Validate currency exchange rate precision in ledger calculations',
      description: 'Ensure floating point calculations use Decimal128 / BigNumber to prevent penny-rounding discrepancies.',
      status: 'review',
      columnId: 'review',
      type: 'bug',
      priority: 'high',
      assigneeId: michaelUser._id,
      reporterId: emilyUser._id,
      storyPoints: 3,
      timeEstimated: 6,
      timeLogged: 5,
      linkedPageIds: [page4._id],
      labelIds: [seededLabels['backend']._id, seededLabels['compliance']._id],
    },

    // --- IN PROGRESS (7 tasks) ---
    {
      key: `${workspaceKey}-12`,
      title: 'Automated end-to-end payment reconciliation suite',
      description: 'Process batch settlements against partner clearing files and flag mismatched balance discrepancies.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'story',
      priority: 'highest',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 8,
      timeEstimated: 18,
      timeLogged: 8,
      linkedPageIds: [page3._id, page4._id],
      labelIds: [seededLabels['backend']._id, seededLabels['payments']._id],
    },
    {
      key: `${workspaceKey}-13`,
      title: 'Interactive Kanban swimlanes by Assignee and Priority',
      description: 'Add user preference switch to group Kanban cards either flat or categorized by assignee and priority levels.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'story',
      priority: 'medium',
      assigneeId: sarahUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 10,
      timeLogged: 4,
      linkedPageIds: [],
      labelIds: [seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-14`,
      title: 'Implement real-time member typing indicators in document headers',
      description: 'Leverage Socket.IO page room awareness to show active collaborators avatars in real-time.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'story',
      priority: 'medium',
      assigneeId: demoUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 8,
      timeLogged: 3,
      linkedPageIds: [page1._id],
      labelIds: [seededLabels['frontend']._id, seededLabels['backend']._id],
    },
    {
      key: `${workspaceKey}-15`,
      title: 'Optimize MongoDB compound indexes for workspace search and filters',
      description: 'Added { workspaceId: 1, status: 1, isDeleted: 1 } and { workspaceId: 1, parentId: 1 } to achieve sub-10ms queries.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'task',
      priority: 'high',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 6,
      timeLogged: 3,
      linkedPageIds: [page1._id],
      labelIds: [seededLabels['backend']._id],
    },
    {
      key: `${workspaceKey}-16`,
      title: 'E2E testing for 1-Click Demo Login flow across device viewports',
      description: 'Validate responsive layout on desktop, tablet, and mobile screens with zero layout shifts.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'task',
      priority: 'medium',
      assigneeId: emilyUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 6,
      timeLogged: 2,
      linkedPageIds: [page5._id],
      labelIds: [seededLabels['devops']._id, seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-17`,
      title: 'Add export capability for Confluence pages to PDF / Markdown',
      description: 'Allow team members to download technical specifications as formatted PDF documents for compliance reviews.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'story',
      priority: 'low',
      assigneeId: sarahUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 8,
      timeLogged: 2,
      linkedPageIds: [page5._id],
      labelIds: [seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-18`,
      title: 'Implement Dark Mode contrast fine-tuning for code blocks and tables',
      description: 'Adjust syntax highlighting theme colors to meet WCAG AA accessibility standards in dark themes.',
      status: 'inprogress',
      columnId: 'inprogress',
      type: 'bug',
      priority: 'low',
      assigneeId: sarahUser._id,
      reporterId: emilyUser._id,
      storyPoints: 2,
      timeEstimated: 4,
      timeLogged: 1,
      linkedPageIds: [],
      labelIds: [seededLabels['frontend']._id],
    },

    // --- TO DO (6 tasks) ---
    {
      key: `${workspaceKey}-19`,
      title: 'Multi-factor authentication (MFA / TOTP) support for Admin accounts',
      description: 'Integrate RFC 6238 TOTP authenticator app support with backup one-time recovery codes.',
      status: 'todo',
      columnId: 'todo',
      type: 'story',
      priority: 'high',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 14,
      timeLogged: 0,
      linkedPageIds: [page2._id],
      labelIds: [seededLabels['security']._id, seededLabels['compliance']._id],
    },
    {
      key: `${workspaceKey}-20`,
      title: 'Webhook signature verification unit tests against bank edge cases',
      description: 'Cover replay attacks, expired timestamps, malformed payload envelopes, and invalid shared secrets.',
      status: 'todo',
      columnId: 'todo',
      type: 'task',
      priority: 'high',
      assigneeId: emilyUser._id,
      reporterId: michaelUser._id,
      storyPoints: 3,
      timeEstimated: 8,
      timeLogged: 0,
      linkedPageIds: [page4._id],
      labelIds: [seededLabels['devops']._id, seededLabels['security']._id],
    },
    {
      key: `${workspaceKey}-21`,
      title: 'Customizable Kanban card tags and badge colors',
      description: 'Provide workspace admins with color picker palette for custom category tags and visual flags.',
      status: 'todo',
      columnId: 'todo',
      type: 'task',
      priority: 'medium',
      assigneeId: sarahUser._id,
      reporterId: demoUser._id,
      storyPoints: 2,
      timeEstimated: 5,
      timeLogged: 0,
      linkedPageIds: [],
      labelIds: [seededLabels['frontend']._id],
    },
    {
      key: `${workspaceKey}-22`,
      title: 'Export workspace burndown report to CSV & Excel format',
      description: 'Generate sprint velocity and completion rate metrics for quarterly management review meetings.',
      status: 'todo',
      columnId: 'todo',
      type: 'task',
      priority: 'low',
      assigneeId: demoUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 6,
      timeLogged: 0,
      linkedPageIds: [page5._id],
      labelIds: [seededLabels['backend']._id],
    },
    {
      key: `${workspaceKey}-23`,
      title: 'Configure automated Docker multi-stage build container',
      description: 'Setup lightweight Alpine-based container image with non-root security context and minimal image layer caching.',
      status: 'todo',
      columnId: 'todo',
      type: 'task',
      priority: 'medium',
      assigneeId: michaelUser._id,
      reporterId: demoUser._id,
      storyPoints: 3,
      timeEstimated: 6,
      timeLogged: 0,
      linkedPageIds: [page6._id],
      labelIds: [seededLabels['devops']._id],
    },
    {
      key: `${workspaceKey}-24`,
      title: 'Load testing payment endpoint under 1,000 req/sec peak surge',
      description: 'Simulate flash-sale traffic spikes using k6 / artillery to ensure p99 latency stays strictly under 200ms.',
      status: 'todo',
      columnId: 'todo',
      type: 'task',
      priority: 'high',
      assigneeId: emilyUser._id,
      reporterId: demoUser._id,
      storyPoints: 5,
      timeEstimated: 10,
      timeLogged: 0,
      linkedPageIds: [page3._id, page4._id],
      labelIds: [seededLabels['devops']._id, seededLabels['backend']._id],
    },
  ];

  const createdTasks: any[] = [];
  for (const t of tasksRaw) {
    const searchNormalized = normalizeForSearch(`${t.title} ${t.description || ''} ${t.key}`);
    const taskDoc = await TaskModel.create({
      workspaceId,
      status: t.status,
      columnId: t.columnId,
      version: 1,
      key: t.key,
      title: t.title,
      description: t.description,
      type: t.type,
      priority: t.priority,
      assigneeId: t.assigneeId,
      reporterId: t.reporterId,
      storyPoints: t.storyPoints,
      timeEstimated: t.timeEstimated,
      timeLogged: t.timeLogged,
      linkedPageIds: t.linkedPageIds,
      labelIds: t.labelIds,
      isArchived: false,
      isDeleted: false,
      searchTokens: searchNormalized.split(/\s+/).filter(Boolean),
      startDate: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });
    createdTasks.push(taskDoc);
  }
  console.log(`   + Created ${createdTasks.length} tasks successfully.`);

  // Update Confluence pages with reverse linkedTaskIds
  console.log('🔗 Establishing Bi-directional Page <-> Task Links...');
  for (const task of createdTasks) {
    if (task.linkedPageIds && task.linkedPageIds.length > 0) {
      await PageModel.updateMany(
        { _id: { $in: task.linkedPageIds } },
        { $addToSet: { linkedTaskIds: task._id } },
      );
    }
  }

  // Update TaskCounter
  await TaskCounterModel.findOneAndUpdate(
    { workspaceId },
    { $set: { workspaceId, taskSequence: 24 } },
    { upsert: true },
  );

  console.log('\n======================================================');
  console.log('🎉 PORTFOLIO DEMO SEED COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('🔑 Demo Login Account:');
  console.log('   Email:    demo@altask.dev');
  console.log('   Password: Demo@123456');
  console.log(`🏢 Workspace: ${workspace.name} (Key: ${workspaceKey})`);
  console.log('📋 Tasks:     24 realistic FinTech tasks seeded');
  console.log('📚 Pages:     6 Confluence technical documentation pages');
  console.log('🔗 Links:     Bi-directional Task <-> Document links established');
  console.log('======================================================\n');
}

seedPortfolio()
  .catch((err) => {
    console.error('❌ Error during seedPortfolio:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
