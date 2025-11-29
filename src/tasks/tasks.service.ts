import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const newTask = new this.taskModel({
      ...createTaskDto,
      createdBy: userId,
    });
    const savedTask = await newTask.save();
    
    // Populate the createdBy field after saving
    return this.taskModel
      .findById(savedTask._id)
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel
      .find()
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel
      .findById(id)
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findByConstructionSite(siteId: string): Promise<Task[]> {
    if (!Types.ObjectId.isValid(siteId)) {
      throw new BadRequestException('Invalid construction site ID');
    }

    return this.taskModel
      .find({ constructionSiteId: siteId })
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, dueDate: 1 })
      .exec();
  }

  async findByWorker(workerId: string): Promise<Task[]> {
    if (!Types.ObjectId.isValid(workerId)) {
      throw new BadRequestException('Invalid worker ID');
    }

    return this.taskModel
      .find({ assignedWorkers: workerId })
      .populate('constructionSiteId', 'name adresse')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, dueDate: 1 })
      .exec();
  }

  async findByOwner(ownerId: string): Promise<Task[]> {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new BadRequestException('Invalid owner ID');
    }

    return this.taskModel
      .find({ createdBy: ownerId })
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.taskModel
      .find({ status })
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, dueDate: 1 })
      .exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  async updateProgress(id: string, updateProgressDto: UpdateProgressDto): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const updateData: any = {
      progressPercentage: updateProgressDto.progressPercentage,
    };

    if (updateProgressDto.notes) {
      updateData.notes = updateProgressDto.notes;
    }

    // Auto-update status based on progress
    if (updateProgressDto.progressPercentage === 0) {
      updateData.status = TaskStatus.NOT_STARTED;
    } else if (updateProgressDto.progressPercentage === 100) {
      updateData.status = TaskStatus.COMPLETED;
      updateData.completedDate = new Date();
    } else {
      updateData.status = TaskStatus.IN_PROGRESS;
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const updateData: any = { status };

    if (status === TaskStatus.COMPLETED) {
      updateData.completedDate = new Date();
      updateData.progressPercentage = 100;
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  async assignWorkers(id: string, workerIds: string[]): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    for (const workerId of workerIds) {
      if (!Types.ObjectId.isValid(workerId)) {
        throw new BadRequestException(`Invalid worker ID: ${workerId}`);
      }
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(
        id,
        { assignedWorkers: workerIds },
        { new: true }
      )
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const result = await this.taskModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return this.taskModel
      .find({
        dueDate: { $lt: now },
        status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
      })
      .populate('constructionSiteId', 'name adresse')
      .populate('assignedWorkers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ dueDate: 1 })
      .exec();
  }

  async getTaskStats(siteId?: string) {
    const match: any = {};
    if (siteId) {
      if (!Types.ObjectId.isValid(siteId)) {
        throw new BadRequestException('Invalid construction site ID');
      }
      match.constructionSiteId = new Types.ObjectId(siteId);
    }

    const stats = await this.taskModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await this.taskModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTasks = await this.taskModel.countDocuments(match);
    const completedTasks = await this.taskModel.countDocuments({
      ...match,
      status: TaskStatus.COMPLETED,
    });
    const overdueTasks = await this.taskModel.countDocuments({
      ...match,
      dueDate: { $lt: new Date() },
      status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
    });

    return {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      byStatus: stats,
      byPriority: priorityStats,
    };
  }
}
