import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignWorkersDto } from './dto/assign-workers.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { TaskStatus } from './schemas/task.schema';
import { JwtAuthGuard } from '../config/guards/jwt-auth.guard';
import { RolesGuard } from '../config/guards/role.guard';
import { Roles } from '../config/decorators/role.decorators';
import { UserRole } from '../users/schema/role.enum';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.CONSTRUCTION_MANAGER)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('stats')
  getStats(@Query('siteId') siteId?: string) {
    return this.tasksService.getTaskStats(siteId);
  }

  @Get('overdue')
  getOverdueTasks() {
    return this.tasksService.getOverdueTasks();
  }

  @Get('by-status/:status')
  findByStatus(@Param('status') status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  @Get('by-site/:siteId')
  findByConstructionSite(@Param('siteId') siteId: string) {
    return this.tasksService.findByConstructionSite(siteId);
  }

  @Get('by-worker/:workerId')
  findByWorker(@Param('workerId') workerId: string) {
    return this.tasksService.findByWorker(workerId);
  }

  @Get('my-tasks')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.CONSTRUCTION_MANAGER)
  findByOwner(@Request() req) {
    const ownerId = req.user.sub;
    return this.tasksService.findByOwner(ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.CONSTRUCTION_MANAGER)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string, 
    @Body() updateProgressDto: UpdateProgressDto
  ) {
    return this.tasksService.updateProgress(id, updateProgressDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: TaskStatus
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.CONSTRUCTION_MANAGER)
  assignWorkers(
    @Param('id') id: string, 
    @Body() assignWorkersDto: AssignWorkersDto
  ) {
    return this.tasksService.assignWorkers(id, assignWorkersDto.workerIds);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.CONSTRUCTION_MANAGER)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
