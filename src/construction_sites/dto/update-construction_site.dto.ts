import { PartialType } from '@nestjs/mapped-types';
import { CreateConstructionSiteDto } from './create-construction_site.dto';

export class UpdateConstructionSiteDto extends PartialType(CreateConstructionSiteDto) {}
