import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { UserRole } from './role.enum';

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Stored as hash

  @Prop()
  phonenumber:string;

  @Prop({ required: true, enum: UserRole, default: UserRole.WORKER })
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: Types.ObjectId, ref: 'Site' })
  assignedSite: Types.ObjectId;
  @Prop({ default: true })
  isActive: boolean;

  
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);