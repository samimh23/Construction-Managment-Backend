import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConstructionSite } from './schemas/Construction_Site.schema';

import { UpdateConstructionSiteDto } from './dto/update-construction_site.dto';
import { CreateConstructionSiteDto } from './dto/create-construction_site.dto';

@Injectable()
export class ConstructionSitesService {
  constructor(
    @InjectModel(ConstructionSite.name)
    private readonly constructionSiteModel: Model<ConstructionSite>
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
    const deletedSite = await this.constructionSiteModel.findByIdAndDelete(id).exec();
    if (!deletedSite) {
      throw new NotFoundException(`ConstructionSite #${id} not found`);
    }
    return deletedSite;
  }
}