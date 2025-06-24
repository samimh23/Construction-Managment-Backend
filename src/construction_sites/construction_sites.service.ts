import { Injectable } from '@nestjs/common';
import { CreateConstructionSiteDto } from './dto/create-construction_site.dto';
import { UpdateConstructionSiteDto } from './dto/update-construction_site.dto';

@Injectable()
export class ConstructionSitesService {
  create(createConstructionSiteDto: CreateConstructionSiteDto) {
    return 'This action adds a new constructionSite';
  }

  findAll() {
    return `This action returns all constructionSites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} constructionSite`;
  }

  update(id: number, updateConstructionSiteDto: UpdateConstructionSiteDto) {
    return `This action updates a #${id} constructionSite`;
  }

  remove(id: number) {
    return `This action removes a #${id} constructionSite`;
  }
}
