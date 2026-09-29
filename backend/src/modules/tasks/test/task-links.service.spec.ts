import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TaskLinksService } from '../services/task-links.service';
import { Task } from '../schemas/task.schema';
import { Page } from '../../pages/schemas/page.schema';

describe('TaskLinksService', () => {
  let service: TaskLinksService;
  let mockTaskModel: any;
  let mockPageModel: any;

  const validTaskId = new Types.ObjectId().toString();
  const validPageId = new Types.ObjectId().toString();

  beforeEach(async () => {
    mockTaskModel = {
      findById: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn(),
    };

    mockPageModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskLinksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
        {
          provide: getModelToken(Page.name),
          useValue: mockPageModel,
        },
      ],
    }).compile();

    service = module.get<TaskLinksService>(TaskLinksService);
  });

  describe('linkPage', () => {
    it('should throw BadRequestException if taskId or pageId is invalid', async () => {
      await expect(
        service.linkPage('ws-1', 'invalid-id', validPageId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if task is not found', async () => {
      mockTaskModel.findById.mockResolvedValue(null);
      mockPageModel.findById.mockResolvedValue({ _id: validPageId });

      await expect(
        service.linkPage('ws-1', validTaskId, validPageId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if page is not found', async () => {
      mockTaskModel.findById.mockResolvedValue({ _id: validTaskId });
      mockPageModel.findById.mockResolvedValue(null);

      await expect(
        service.linkPage('ws-1', validTaskId, validPageId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should link task and page successfully', async () => {
      mockTaskModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: validTaskId,
            linkedPageIds: [
              {
                _id: new Types.ObjectId(validPageId),
                title: 'PRD Spec',
                slug: 'prd-spec',
                updatedAt: new Date(),
              },
            ],
          }),
        }),
      });
      mockPageModel.findById.mockResolvedValue({ _id: validPageId });
      mockTaskModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockPageModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.linkPage('ws-1', validTaskId, validPageId);

      expect(mockTaskModel.updateOne).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(validTaskId) },
        { $addToSet: { linkedPageIds: new Types.ObjectId(validPageId) } },
      );
      expect(mockPageModel.updateOne).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(validPageId) },
        { $addToSet: { linkedTaskIds: new Types.ObjectId(validTaskId) } },
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('PRD Spec');
    });
  });

  describe('unlinkPage', () => {
    it('should unlink task and page successfully', async () => {
      mockTaskModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockPageModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockTaskModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: validTaskId,
            linkedPageIds: [],
          }),
        }),
      });

      const result = await service.unlinkPage('ws-1', validTaskId, validPageId);

      expect(mockTaskModel.updateOne).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(validTaskId) },
        { $pull: { linkedPageIds: new Types.ObjectId(validPageId) } },
      );
      expect(mockPageModel.updateOne).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(validPageId) },
        { $pull: { linkedTaskIds: new Types.ObjectId(validTaskId) } },
      );
      expect(result).toEqual([]);
    });
  });

  describe('getLinkedTasksForPage', () => {
    it('should return linked tasks for page', async () => {
      mockPageModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(validPageId),
        linkedTaskIds: [new Types.ObjectId(validTaskId)],
      });

      mockTaskModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: new Types.ObjectId(validTaskId),
              key: 'AL-1',
              title: 'Implement Auth',
              status: 'done',
              columnId: 'done',
              priority: 'High',
              type: 'Task',
            },
          ]),
        }),
      });

      const result = await service.getLinkedTasksForPage(validPageId);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('AL-1');
      expect(result[0].title).toBe('Implement Auth');
    });
  });
});
