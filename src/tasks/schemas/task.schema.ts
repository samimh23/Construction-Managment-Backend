import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'ConstructionSite', required: true })
  constructionSiteId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(TaskStatus), 
    default: TaskStatus.NOT_STARTED 
  })
  status: TaskStatus;

  @Prop({ 
    type: String, 
    enum: Object.values(TaskPriority), 
    default: TaskPriority.MEDIUM 
  })
  priority: TaskPriority;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  assignedWorkers: Types.ObjectId[];

  @Prop()
  startDate: Date;

  @Prop()
  dueDate: Date;

  @Prop()
  completedDate: Date;

  @Prop({ min: 0, max: 100, default: 0 })
  progressPercentage: number;

  @Prop()
  estimatedHours: number;

  @Prop()
  actualHours: number;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
