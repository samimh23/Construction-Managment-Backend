import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConstructionSite } from './Schemas/Construction_Site.schema';
import { CreateConstructionSiteDto } from './dto/create-construction_site.dto';
import { UpdateConstructionSiteDto } from './dto/update-construction_site.dto';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class ConstructionSitesService {
  constructor(
    @InjectModel(ConstructionSite.name)
    private readonly constructionSiteModel: Model<ConstructionSite>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createConstructionSiteDto: CreateConstructionSiteDto): Promise<ConstructionSite> {
    const createdSite = new this.constructionSiteModel(createConstructionSiteDto);
    return createdSite.save();
  }

  async findAll(): Promise<ConstructionSite[]> {
    return this.constructionSiteModel.find().exec();
  }

  async findOne(id: string): Promise<ConstructionSite> {
    const site = await this.constructionSiteModel.findById(id).exec();
    if (!site) {
      throw new NotFoundException(`ConstructionSite #${id} not found`);
    }
    return site;
  }

  async update(id: string, updateConstructionSiteDto: UpdateConstructionSiteDto): Promise<ConstructionSite> {
    const updatedSite = await this.constructionSiteModel.findByIdAndUpdate(id, updateConstructionSiteDto, { new: true }).exec();
    if (!updatedSite) {
      throw new NotFoundException(`ConstructionSite #${id} not found`);
    }
    return updatedSite;
  }

 async remove(id: string): Promise<ConstructionSite> {
  // Find the site first
  const site = await this.constructionSiteModel.findById(id);
  if (!site) {
    throw new NotFoundException(`ConstructionSite #${id} not found`);
  }

  // Detach workers assigned to this site
  await this.userModel.updateMany(
    { assignedSite: site._id },
    { $unset: { assignedSite: "" } } // or { $set: { assignedSite: null } }
  );

  // Delete the site
  const deletedSite = await this.constructionSiteModel.findByIdAndDelete(id).exec();
  return deletedSite;
}

   async findByOwner(ownerId: string): Promise<ConstructionSite[]> {
    return this.constructionSiteModel.find({ owner: ownerId }).populate('owner', 'name').exec();
  }
}