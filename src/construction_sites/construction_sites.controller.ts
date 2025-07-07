import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConstructionSitesService } from './construction_sites.service';
import { CreateConstructionSiteDto } from './dto/create-construction_site.dto';
import { UpdateConstructionSiteDto } from './dto/update-construction_site.dto';

@Controller('construction-sites')
export class ConstructionSitesController {
  constructor(private readonly constructionSitesService: ConstructionSitesService) {}

  @Post()
  create(@Body() createConstructionSiteDto: CreateConstructionSiteDto) {
    return this.constructionSitesService.create(createConstructionSiteDto);
  }

  @Get()
  findAll() {
    return this.constructionSitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionSitesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConstructionSiteDto: UpdateConstructionSiteDto) {
    return this.constructionSitesService.update(id, updateConstructionSiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionSitesService.remove(id);
  }
}