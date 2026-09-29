import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Page, PageDocument } from '../../pages/schemas/page.schema';

export interface LinkedPageSummary {
  id: string;
  title: string;
  slug: string;
  updatedAt: Date;
}

export interface LinkedTaskSummary {
  id: string;
  key: string;
  title: string;
  status: string;
  columnId?: string;
  priority: string;
  type: string;
}

@Injectable()
export class TaskLinksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Page.name)
    private readonly pageModel: Model<PageDocument>,
  ) {}

  async linkPage(
    _workspaceId: string,
    taskId: string,
    pageId: string,
  ): Promise<LinkedPageSummary[]> {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(pageId)) {
      throw new BadRequestException('Invalid taskId or pageId');
    }

    const taskObjectId = new Types.ObjectId(taskId);
    const pageObjectId = new Types.ObjectId(pageId);

    const [task, page] = await Promise.all([
      this.taskModel.findById(taskObjectId),
      this.pageModel.findById(pageObjectId),
    ]);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found`);
    }

    await Promise.all([
      this.taskModel.updateOne(
        { _id: taskObjectId },
        { $addToSet: { linkedPageIds: pageObjectId } },
      ),
      this.pageModel.updateOne(
        { _id: pageObjectId },
        { $addToSet: { linkedTaskIds: taskObjectId } },
      ),
    ]);

    return this.getLinkedPages(taskId);
  }

  async unlinkPage(
    _workspaceId: string,
    taskId: string,
    pageId: string,
  ): Promise<LinkedPageSummary[]> {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(pageId)) {
      throw new BadRequestException('Invalid taskId or pageId');
    }

    const taskObjectId = new Types.ObjectId(taskId);
    const pageObjectId = new Types.ObjectId(pageId);

    await Promise.all([
      this.taskModel.updateOne(
        { _id: taskObjectId },
        { $pull: { linkedPageIds: pageObjectId } },
      ),
      this.pageModel.updateOne(
        { _id: pageObjectId },
        { $pull: { linkedTaskIds: taskObjectId } },
      ),
    ]);

    return this.getLinkedPages(taskId);
  }

  async getLinkedPages(taskId: string): Promise<LinkedPageSummary[]> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException('Invalid taskId');
    }

    const task = await this.taskModel
      .findById(taskId)
      .populate('linkedPageIds', '_id title slug updatedAt')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return ((task.linkedPageIds as any[]) || [])
      .filter(p => p && p._id)
      .map(p => ({
        id: p._id.toString(),
        title: p.title || 'Untitled Document',
        slug: p.slug,
        updatedAt: p.updatedAt,
      }));
  }

  async getLinkedTasksForPage(pageId: string): Promise<LinkedTaskSummary[]> {
    let pageObjectId: Types.ObjectId;
    if (Types.ObjectId.isValid(pageId)) {
      pageObjectId = new Types.ObjectId(pageId);
    } else {
      const page = await this.pageModel.findOne({ slug: pageId });
      if (!page) throw new NotFoundException('Page not found');
      pageObjectId = page._id;
    }

    const page = await this.pageModel.findById(pageObjectId);

    const tasks = await this.taskModel
      .find({
        $or: [
          { linkedPageIds: pageObjectId },
          { _id: { $in: page?.linkedTaskIds || [] } },
        ],
        isDeleted: { $ne: true },
      })
      .select('_id key title status columnId priority type')
      .exec();

    return tasks.map(t => ({
      id: t._id.toString(),
      key: t.key,
      title: t.title,
      status: t.status,
      columnId: t.columnId,
      priority: t.priority,
      type: t.type,
    }));
  }
}
