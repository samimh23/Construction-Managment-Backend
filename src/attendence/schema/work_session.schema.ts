import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class WorkSession extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  worker: Types.ObjectId;

  @Prop({ required: true })
  checkIn: Date;

  @Prop()
  checkOut: Date;

  @Prop({ type: Types.ObjectId, ref: 'Site' })
  site: Types.ObjectId;
}

export const WorkSessionSchema = SchemaFactory.createForClass(WorkSession);