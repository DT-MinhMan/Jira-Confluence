import { Test, TestingModule } from '@nestjs/testing';
import { TaskLinksController } from '../controllers/task-links.controller';
import { TaskLinksService } from '../services/task-links.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../../../common/guards/workspace-role.guard';

describe('TaskLinksController', () => {
  let controller: TaskLinksController;
  let mockTaskLinksService: any;

  beforeEach(async () => {
    mockTaskLinksService = {
      getLinkedPages: jest.fn(),
      linkPage: jest.fn(),
      unlinkPage: jest.fn(),
      getLinkedTasksForPage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskLinksController],
      providers: [
        {
          provide: TaskLinksService,
          useValue: mockTaskLinksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TaskLinksController>(TaskLinksController);
  });

  it('should get linked pages for task', async () => {
    mockTaskLinksService.getLinkedPages.mockResolvedValue([
      { id: 'page-1', title: 'Doc', slug: 'doc', updatedAt: new Date() },
    ]);

    const result = await controller.getLinkedPages('ws-1', 'task-1');

    expect(mockTaskLinksService.getLinkedPages).toHaveBeenCalledWith('task-1');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Doc');
  });

  it('should link page to task', async () => {
    mockTaskLinksService.linkPage.mockResolvedValue([
      { id: 'page-1', title: 'Doc', slug: 'doc', updatedAt: new Date() },
    ]);

    const result = await controller.linkPage('ws-1', 'task-1', { pageId: 'page-1' });

    expect(mockTaskLinksService.linkPage).toHaveBeenCalledWith('ws-1', 'task-1', 'page-1');
    expect(result).toHaveLength(1);
  });

  it('should unlink page from task', async () => {
    mockTaskLinksService.unlinkPage.mockResolvedValue([]);

    const result = await controller.unlinkPage('ws-1', 'task-1', 'page-1');

    expect(mockTaskLinksService.unlinkPage).toHaveBeenCalledWith('ws-1', 'task-1', 'page-1');
    expect(result).toEqual([]);
  });

  it('should get linked tasks for page', async () => {
    mockTaskLinksService.getLinkedTasksForPage.mockResolvedValue([
      { id: 't-1', key: 'AL-1', title: 'Task', status: 'done', priority: 'High', type: 'Task' },
    ]);

    const result = await controller.getLinkedTasksForPage('page-1');

    expect(mockTaskLinksService.getLinkedTasksForPage).toHaveBeenCalledWith('page-1');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('AL-1');
  });
});
