import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User,  } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { promises } from 'dns';
import { UserRole } from './schema/role.enum';
import { ConstructionSite } from 'src/construction_sites/Schemas/Construction_Site.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
      constructor(@InjectModel(User.name) private userModel: Model<User>,

      @InjectModel(ConstructionSite.name) private siteModel :Model<ConstructionSite>
    
    ) {}

async createConstructionOwner (CreateownerDto:any):Promise<User>{
  const userexists= await this.userModel.findOne({email:CreateownerDto.email})
  if(userexists){
      throw new ConflictException('User with this email already exists');
  }
  const hashedpassword = await bcrypt.hash(CreateownerDto.password,10)
  const createdUser = new this.userModel({
      firstName: CreateownerDto.firstName,
      lastName: CreateownerDto.lastName,
      email: CreateownerDto.email,
      password: hashedpassword,
      phone: CreateownerDto.phone,
      role: UserRole.OWNER, // Fixed role
      isActive: true,
      // No createdBy - owners create themselves
    });
        return createdUser.save();


}

 async addCredentialsToWorker(workerId: string, email: string, password: string, ownerId: string): Promise<User> {
    const worker = await this.userModel.findOne({
      _id: workerId,
      createdBy: ownerId,
      role: UserRole.WORKER,
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    worker.email = email;
    worker.password = hashedPassword;

    return worker.save();
  }

async createWorker(createWorkerDto: any, ownerId: string, siteId: string): Promise<User> {
    if (!siteId) {
      throw new ConflictException('Site ID is required when creating a worker');
    }

    // Verify the site exists and belongs to the owner
    const site = await this.siteModel.findOne({ _id: siteId, owner: ownerId });
    if (!site) {
      throw new NotFoundException('Site not found or you do not own this site');
    }

    // Generate unique worker code
    const workerCode = await this.generateWorkerCode();

    const createdUser = new this.userModel({
      firstName: createWorkerDto.firstName,
      lastName: createWorkerDto.lastName,
      phone: createWorkerDto.phone,
      jobTitle: createWorkerDto.jobTitle,
      role: UserRole.WORKER,
      createdBy: ownerId,
      assignedSite: siteId,
      workerCode: workerCode,
      isActive: true,
      // No email or password for workers
    });

    const savedUser = await createdUser.save();

    // Add worker to site's workers array
    await this.siteModel.findByIdAndUpdate(siteId, {
      $addToSet: { workers: savedUser._id }
    });

    return savedUser;
  }

   private async generateWorkerCode(): Promise<string> {
    const lastWorker = await this.userModel
      .findOne({ role: UserRole.WORKER, workerCode: { $exists: true } })
      .sort({ workerCode: -1 })
      .exec();

    let nextNumber = 1;
    if (lastWorker && lastWorker.workerCode) {
      const lastNumber = parseInt(lastWorker.workerCode.replace('WRK', ''));
      nextNumber = lastNumber + 1;
    }

    return `WRK${nextNumber.toString().padStart(3, '0')}`;
  }

    async findworkerbyname(name:string):Promise<User>{
      const worker = await this.userModel.findOne({
        firstName:name,
        role:{$in:[UserRole.WORKER,UserRole.CONSTRUCTION_MANAGER]}
      })

      return worker;
    }
 
 
      async promoteToManager(workerId: string, siteId: string, ownerId: string): Promise<User> {
    const worker = await this.userModel.findOne({
      _id: workerId,
      createdBy: ownerId,
      role: UserRole.WORKER,
      isActive: true,
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    const site = await this.siteModel.findOne({ _id: siteId, owner: ownerId });
    if (!site) {
      throw new NotFoundException('Site not found');
    }

    if (site.manager) {
      throw new ConflictException('This site already has a manager');
    }

    // For promotion, we need to add email/password
    if (!worker.email) {
      throw new ConflictException('Worker needs email and password to be promoted to manager');
    }

    worker.role = UserRole.CONSTRUCTION_MANAGER;
    worker.assignedSite = siteId as any;
    const updatedWorker = await worker.save();

    // Update site
    await this.siteModel.findByIdAndUpdate(siteId, {
      manager: workerId,
      $pull: { workers: workerId }
    });

    return updatedWorker;
  }


 

 async getManagersWithSites(ownerId:string):Promise<any[]>{
    const managers= await this.userModel.find({
        createdBy:ownerId,
        role:UserRole.CONSTRUCTION_MANAGER,
        isActive:true
    }).select('-password').exec();
    const managerswithsite= await Promise.all(
        managers.map(async (manager)=>
        {
            const site= await this.siteModel.findById(manager.assignedSite)
            .select('name address description startDate endDate isActive')
          .exec();

      return {
          manager: {
            id: manager._id,
            firstName: manager.firstName,
            lastName: manager.lastName,
            email: manager.email,
            phonenumber: manager.phonenumber,
            role: manager.role,
            
          },
          site: site ? {
            id: site._id,
            name: site.name,
            address: site.adresse,
            StartDate: site.StartDate,
            EndDate: site.EndDate,
            isActive: site.isActive,
          } : null,
        };
      })
    );
        return managerswithsite;

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

        // Add this method to your UsersService
async updateRefreshToken(userId: string, refreshToken: string) {
  await this.userModel.findByIdAndUpdate(userId, { refreshToken });
}

async findByEmail(email: string): Promise<User | null> {
  return this.userModel.findOne({ email }).exec();
}

async findById(id: string): Promise<User | null> {
  return this.userModel.findById(id).exec();
}
  }

