import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TaskLinksService } from '../services/task-links.service';

@ApiTags('Task Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskLinksController {
  constructor(private readonly taskLinksService: TaskLinksService) {}

  @Get('workspaces/:workspaceId/board/:taskId/links/pages')
  @ApiOperation({ summary: 'Get linked Confluence pages for a task' })
  async getLinkedPages(
    @Param('workspaceId') _workspaceId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskLinksService.getLinkedPages(taskId);
  }

  @Post('workspaces/:workspaceId/board/:taskId/links/pages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link a Confluence page to a task' })
  async linkPage(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Body() body: { pageId: string },
  ) {
    return this.taskLinksService.linkPage(workspaceId, taskId, body.pageId);
  }

  @Delete('workspaces/:workspaceId/board/:taskId/links/pages/:pageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink a Confluence page from a task' })
  async unlinkPage(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('pageId') pageId: string,
  ) {
    return this.taskLinksService.unlinkPage(workspaceId, taskId, pageId);
  }

  // Also support direct /tasks/:id/links/page
  @Post('tasks/:taskId/links/page')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link a Confluence page to a task (direct)' })
  async linkPageDirect(
    @Param('taskId') taskId: string,
    @Body() body: { pageId: string; workspaceId?: string },
  ) {
    return this.taskLinksService.linkPage(
      body.workspaceId || '',
      taskId,
      body.pageId,
    );
  }

  @Delete('tasks/:taskId/links/page/:pageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink a Confluence page from a task (direct)' })
  async unlinkPageDirect(
    @Param('taskId') taskId: string,
    @Param('pageId') pageId: string,
  ) {
    return this.taskLinksService.unlinkPage('', taskId, pageId);
  }

  @Get('pages/:pageId/linked-tasks')
  @ApiOperation({ summary: 'Get linked Jira tasks for a Confluence page' })
  async getLinkedTasksForPage(@Param('pageId') pageId: string) {
    return this.taskLinksService.getLinkedTasksForPage(pageId);
  }
}
