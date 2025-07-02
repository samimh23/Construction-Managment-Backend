import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccessCodeDocument = AccessCode & Document;

@Schema({ timestamps: true })
export class AccessCode {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  manager: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  site: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const AccessCodeSchema = SchemaFactory.createForClass(AccessCode);