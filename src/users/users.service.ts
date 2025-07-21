import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User,  } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    });
        return createdUser.save();


}



async getSiteAndWorkersForManager(managerId: string) {
  const manager = await this.userModel.findById(managerId);
  if (!manager || manager.role !== UserRole.CONSTRUCTION_MANAGER) {
    throw new NotFoundException('Manager not found');
  }
  if (!manager.assignedSite) {
    throw new NotFoundException('Manager is not assigned to a site');
  }
  const site = await this.siteModel
    .findById(manager.assignedSite)
    .populate('workers')
    .exec();

  if (!site) throw new NotFoundException('Assigned site not found');

  const workers = (site.workers as any[]).filter(w => w.role === UserRole.WORKER);

  return {
    site,
    workers,
  };
}

async assignWorkerToSite(workerId: string, siteId: string, ownerId: string): Promise<User> {
    const worker = await this.userModel.findOne({
      _id: workerId,
      createdBy: ownerId,
      role: UserRole.WORKER,
      isActive: true,
    });

    if (!worker) {
      throw new NotFoundException('Worker not found or not owned by you');
    }
    
    const site = await this.siteModel.findOne({ _id: siteId, owner: ownerId });
    if (!site) {
      throw new NotFoundException('Site not found or not owned by you');
    }

    if (String(worker.assignedSite) === String(siteId)) {
      throw new ConflictException('Worker is already assigned to this site');
    }

    if (worker.assignedSite) {
      await this.siteModel.findByIdAndUpdate(worker.assignedSite, {
        $pull: { workers: worker._id }
      });
    }

worker.assignedSite = new Types.ObjectId(siteId);
    await worker.save();

    await this.siteModel.findByIdAndUpdate(siteId, {
      $addToSet: { workers: worker._id }
    });

    return worker;
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

    const site = await this.siteModel.findOne({ _id: siteId, owner: ownerId });
    if (!site) {
      throw new NotFoundException('Site not found or you do not own this site');
    }

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
    });

    const savedUser = await createdUser.save();

    // Add worker to site's workers array
    await this.siteModel.findByIdAndUpdate(siteId, {
      $addToSet: { workers: savedUser._id }
    });

    return savedUser;
  }

    async getallworkerbyowner(ownerId:string){
      const workers= await this.userModel.find({
        createdBy:ownerId,
         role:{$in:[UserRole.WORKER,UserRole.CONSTRUCTION_MANAGER]}
      })
      return workers;
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

    if (!worker.email) {
      throw new ConflictException('Worker needs email and password to be promoted to manager');
    }

    worker.role = UserRole.CONSTRUCTION_MANAGER;
    worker.assignedSite = siteId as any;
    const updatedWorker = await worker.save();

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

