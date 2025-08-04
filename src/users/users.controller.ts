import { Body, Controller, ForbiddenException, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './schema/role.enum';
import { RolesGuard } from 'src/config/guards/role.guard';
import { Roles } from 'src/config/decorators/role.decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from './schema/user.schema';
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
@Post('register-owner') 
async registerowner(@Body() CreateOwnerDto: any){
  return this.usersService.createConstructionOwner(CreateOwnerDto)
}

  @UseGuards(RolesGuard)
  @Post('create-worker')
  @Roles(UserRole.OWNER)
  async createWorker(@Body() createWorkerDto: any, @Req() req) {
    const ownerId = req.user.sub;
    return this.usersService.createWorker(createWorkerDto, ownerId, createWorkerDto.siteId);
  }

  @UseGuards(RolesGuard)
  @Put('add-credentials/:workerId')
  @Roles(UserRole.OWNER)
  async addCredentialsToWorker(
    @Param('workerId') workerId: string,
    @Body() credentialsDto: { email: string; password: string },
    @Req() req
  ) {
    const ownerId = req.user.sub;
    return this.usersService.addCredentialsToWorker(workerId, credentialsDto.email, credentialsDto.password, ownerId);
  }

  @UseGuards(RolesGuard)
  @Put('promote/:workerId/site/:siteId')
  @Roles(UserRole.OWNER)
  async promoteWorkertoMangaer(@Param('workerId') workerId: string, @Param('siteId') siteId: string, @Req() req) {
    const ownerId = req.user.sub;
    return this.usersService.promoteToManager(workerId, siteId, ownerId);
  }

  @UseGuards(RolesGuard)
  @Get('site/:siteId/workers')
  @Roles(UserRole.CONSTRUCTION_MANAGER)
  async getSiteWorkers(@Param('siteId') siteId: string, @Req() req) {
    if (req.user.siteId !== siteId) {
      throw new ForbiddenException('You can only access workers from your assigned site');
    }
    return this.usersService.findWorkersBySite(siteId);
  }
@UseGuards(RolesGuard)
   @Get('by-owner')
   @Roles(UserRole.OWNER)
  async getWorkersByOwner( @Req() req) {
    const ownerId = req.user.sub;
    return this.usersService.getWorkersByOwner(ownerId);
  }

  @UseGuards(RolesGuard)
  @Get('managers-with-sites')
  @Roles(UserRole.OWNER)
  async getManagersWithSites(@Req() req) {
    const ownerId = req.user.sub;
    return this.usersService.getManagersWithSites(ownerId);
  }

  @UseGuards(RolesGuard)
@Put('assign-worker/:workerId/site/:siteId')
@Roles(UserRole.OWNER)
async assignWorkerToSite(
  @Param('workerId') workerId: string,
  @Param('siteId') siteId: string,
  @Req() req,
) {
  const ownerId = req.user.sub;
  return this.usersService.assignWorkerToSite(workerId, siteId, ownerId);
}


@UseGuards(RolesGuard)
@Get('manager/site-and-workers')
@Roles(UserRole.CONSTRUCTION_MANAGER)
async getManagerSiteAndWorkers(@Req() req) {
  const managerId = req.user.sub;
  return this.usersService.getSiteAndWorkersForManager(managerId);
}
 @Get(':id')
  async findById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }
}


