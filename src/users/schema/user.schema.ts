import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { UserRole } from './role.enum';

@Schema({timestamps: true })

export class User extends Document  {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

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

  @Prop()
  workerCode: string

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken: string;

  

  
}


export const UserSchema = SchemaFactory.createForClass(User);