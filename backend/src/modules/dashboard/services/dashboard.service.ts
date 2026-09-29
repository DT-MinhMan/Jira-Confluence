import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from '../../tasks/schemas/task.schema';
import { Workspace } from '../../workspaces/schemas/workspace.schema';
import { Sprint } from '../../scrum/schemas/sprint.schema';
import { Page } from '../../pages/schemas/page.schema';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(Sprint.name) private sprintModel: Model<Sprint>,
    @InjectModel(Page.name) private pageModel: Model<Page>,
  ) {}

  async getWorkspaceOverview(workspaceId: string, userId: string) {
    this.logger.log(
      `Getting workspace overview for workspaceId: ${workspaceId}, userId: ${userId}`,
    );

    const workspaceObjectId = new Types.ObjectId(workspaceId);
    const userObjectId = new Types.ObjectId(userId);

    const [facetResults, activeSprints, workspace] = await Promise.all([
      this.taskModel.aggregate([
        {
          $match: {
            workspaceId: workspaceObjectId,
            isDeleted: { $ne: true },
          },
        },
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [{ $group: { _id: '$columnId', count: { $sum: 1 } } }],
            byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
            byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
            recentTasks: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $project: {
                  title: 1,
                  key: 1,
                  columnId: 1,
                  type: 1,
                  createdAt: 1,
                  priority: 1,
                },
              },
            ],
            myTasks: [
              { $match: { assigneeId: userObjectId } },
              { $sort: { dueDate: 1, createdAt: -1 } },
              { $limit: 10 },
              {
                $project: {
                  title: 1,
                  key: 1,
                  columnId: 1,
                  type: 1,
                  priority: 1,
                  workspaceId: 1,
                  createdAt: 1,
                  dueDate: 1,
                },
              },
            ],
          },
        },
      ]),
      this.sprintModel.countDocuments({
        workspaceId: workspaceObjectId,
        status: 'active',
      }),
      this.workspaceModel.findById(workspaceObjectId, { _id: 1 }),
    ]);

    const facet = facetResults[0] || {};
    const totalTasks = facet.total?.[0]?.count || 0;
    const tasksByStatus: { _id: string; count: number }[] =
      facet.byStatus || [];
    const tasksByType = facet.byType || [];
    const tasksByPriority = facet.byPriority || [];
    const recentTasks = facet.recentTasks || [];
    const myTasks = facet.myTasks || [];

    const completedTasks =
      tasksByStatus.find(s => s._id === 'done')?.count || 0;

    return {
      totalWorkspaces: workspace ? 1 : 0,
      totalTasks,
      completedTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByStatus,
      tasksByType,
      tasksByPriority,
      recentTasks,
      myTasks,
      activeSprints,
    };
  }

  async getWorkspaceStats(workspaceId: string) {
    this.logger.log(`Getting Workspace stats for workspaceId: ${workspaceId}`);

    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const [facetResults, activeSprint] = await Promise.all([
      this.taskModel.aggregate([
        {
          $match: {
            workspaceId: workspaceObjectId,
            isDeleted: { $ne: true },
          },
        },
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [{ $group: { _id: '$columnId', count: { $sum: 1 } } }],
            byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
            byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
            byAssignee: [
              { $match: { assigneeId: { $ne: null } } },
              { $group: { _id: '$assigneeId', count: { $sum: 1 } } },
              {
                $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              { $unwind: '$user' },
              {
                $project: {
                  count: 1,
                  user: {
                    _id: '$user._id',
                    name: '$user.fullName',
                    email: '$user.email',
                    avatarUrl: '$user.avatar',
                  },
                },
              },
            ],
          },
        },
      ]),
      this.sprintModel.findOne({
        workspaceId: workspaceObjectId,
        status: 'active',
      }),
    ]);

    const facet = facetResults[0] || {};
    const totalTasks = facet.total?.[0]?.count || 0;
    const tasksByStatus: { _id: string; count: number }[] =
      facet.byStatus || [];
    const tasksByType = facet.byType || [];
    const tasksByPriority = facet.byPriority || [];
    const tasksByAssignee = facet.byAssignee || [];

    const completedTasks =
      tasksByStatus.find(s => s._id === 'done')?.count || 0;
    const inProgressTasks = tasksByStatus
      .filter(s => s._id === 'inprogress' || s._id === 'in_progress')
      .reduce((sum, s) => sum + s.count, 0);
    const todoTasks = tasksByStatus.find(s => s._id === 'todo')?.count || 0;

    let sprintProgress: any = null;
    if (activeSprint) {
      const sprintTasks = await this.taskModel
        .find({
          workspaceId: workspaceObjectId,
          sprintId: activeSprint._id,
          isDeleted: { $ne: true },
        })
        .select('storyPoints columnId')
        .exec();

      const totalPoints = sprintTasks.reduce(
        (sum, task) => sum + (task.storyPoints || 0),
        0,
      );
      const completedPoints = sprintTasks
        .filter(task => task.columnId === 'done')
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

      sprintProgress = {
        sprintId: activeSprint._id.toString(),
        sprintName: `Sprint ${activeSprint._id.toString().substring(activeSprint._id.toString().length - 4)}`,
        totalStoryPoints: totalPoints,
        completedStoryPoints: completedPoints,
        completionPercentage:
          totalPoints > 0
            ? Math.round((completedPoints / totalPoints) * 100)
            : 0,
      };
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByStatus,
      tasksByType,
      tasksByPriority,
      tasksByAssignee,
      sprintProgress,
    };
  }

  async getUserStats(userId: string) {
    this.logger.log(`Getting user stats for userId: ${userId}`);

    const userObjectId = new Types.ObjectId(userId);

    const tasksAssigned = await this.taskModel.countDocuments({
      assigneeId: userObjectId,
    });

    const tasksByStatus = await this.taskModel.aggregate([
      { $match: { assigneeId: userObjectId } },
      { $group: { _id: '$columnId', count: { $sum: 1 } } },
    ]);

    const tasksByPriority = await this.taskModel.aggregate([
      { $match: { assigneeId: userObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const recentlyCompleted = await this.taskModel
      .find({
        assigneeId: userObjectId,
        columnId: 'done',
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title key type priority workspaceId completedAt')
      .populate('workspaceId', 'name key')
      .exec();

    const recentActivity = await this.taskModel
      .find({
        $or: [{ createdBy: userObjectId }, { updatedBy: userObjectId }],
      })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select(
        'title key columnId type priority workspaceId createdAt updatedAt createdBy updatedBy',
      )
      .populate('workspaceId', 'name key type')
      .exec();

    const myTasks = await this.taskModel
      .find({ assigneeId: userObjectId })
      .select(
        'title key columnId type priority workspaceId createdAt updatedAt',
      )
      .populate('workspaceId', 'name key type')
      .exec();

    return {
      tasksAssigned,
      tasksByStatus,
      tasksByPriority,
      recentlyCompleted,
      recentActivity,
      myTasks,
    };
  }

  async getSprintProgress(sprintId: string) {
    this.logger.log(`Getting sprint progress for sprintId: ${sprintId}`);

    const sprintObjectId = new Types.ObjectId(sprintId);
    const sprint = await this.sprintModel.findById(sprintObjectId);

    if (!sprint) {
      return null;
    }

    const tasks = await this.taskModel
      .find({ sprintId: sprintObjectId })
      .select('title key columnId type priority storyPoints assigneeId')
      .populate('assigneeId', 'name email avatarUrl')
      .exec();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.columnId === 'done').length;
    const totalStoryPoints = tasks.reduce(
      (sum, task) => sum + (task.storyPoints || 0),
      0,
    );
    const completedStoryPoints = tasks
      .filter(task => task.columnId === 'done')
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    const tasksByStatus = await this.taskModel.aggregate([
      { $match: { sprintId: sprintObjectId } },
      { $group: { _id: '$columnId', count: { $sum: 1 } } },
    ]);

    return {
      sprint: {
        _id: sprint._id,
        name: `Sprint ${sprint._id.toString().substring(sprint._id.toString().length - 4)}`,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      totalTasks,
      completedTasks,
      totalStoryPoints,
      completedStoryPoints,
      completionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      storyPointsCompletionPercentage:
        totalStoryPoints > 0
          ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
          : 0,
      tasksByStatus,
      tasks: tasks.map(task => ({
        _id: task._id,
        title: task.title,
        key: task.key,
        status: task.columnId,
        type: task.type,
        priority: task.priority,
        storyPoints: task.storyPoints,
        assignee: task.assigneeId,
      })),
    };
  }
}
