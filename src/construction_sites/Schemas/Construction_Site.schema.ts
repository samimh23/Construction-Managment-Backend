import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

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
}
export const ConstructionSiteSchema = SchemaFactory.createForClass(ConstructionSite)