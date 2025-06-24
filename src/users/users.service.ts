import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { promises } from 'dns';
import { UserRole } from './schema/role.enum';

@Injectable()
export class UsersService {
      constructor(@InjectModel(User.name) private userModel: Model<UserDocument>
    
    ) {}
 
 
      async PromoteToManager (workerId:string): Promise<User>{
        const user= await this.userModel.findById({workerId})
        if(!user){
            throw new NotFoundException('worker doesnt exist')
        }
        user.role=UserRole.CONSTRUCTION_MANAGER;

        return user.save();

 }

 async getManagersWithSites(ownerId:string):Promise<User[]>{
    const managers= await this.userModel.find({
        createdBy:ownerId,
        role:UserRole.CONSTRUCTION_MANAGER,
        isActive:true
    }).select('-password').exec();
    const managerswithsite= await Promise.all(
        managers.map(async (manager)=>
        {
            const site= await 
        }
        )
    )
 }
 
 
      async getWorkersByOwner(ownerId:string):Promise<User[]>{
        return this.userModel.find({
            createdBy:ownerId,
            role: { $in: [UserRole.WORKER, UserRole.CONSTRUCTION_MANAGER] },
                isActive: true,
             }).exec();

        }

        async findWorkersBySite (siteId:string):Promise<User[]> {
          return this.userModel.find({
            assignedSite:siteId,
        role:{$in:[UserRole.WORKER,UserRole.CONSTRUCTION_MANAGER]},
        isActive:true}).exec();
          
        }
  }

