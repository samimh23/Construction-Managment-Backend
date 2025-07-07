import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';
import { User } from "src/users/schema/user.schema";

@Schema()
export class ConstructionSite extends Document
{
 @Prop()
 name : string;
 @Prop()
 adresse : string;
 @Prop({type : Object})
 GeoLocation? :{longitude : string ; Latitude : string} ;
 @Prop({type : Object})
 GeoFence? : {center : { longitude : string ; Latitude : string}; radius : string};
 @Prop()
 StartDate : Date;
 
 @Prop()
 EndDate : Date;

 @Prop()
 Budget : string;

 @Prop()
 isActive:boolean;

 @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;

  // 🔗 Add manager (user)
  @Prop({ type: Types.ObjectId, ref: 'User' })
  manager: User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  workers: User[];
}
export const ConstructionSiteSchema = SchemaFactory.createForClass(ConstructionSite)