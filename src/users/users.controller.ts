import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
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

 /* @Post('register-owner') 
  async registerowner(@Body() CreateOwnerDto: any){
    return this.usersService.createConstructionOwner(CreateOwnerDto)
  }*/

  // MOVE SPECIFIC ROUTES FIRST - BEFORE PARAMETERIZED ROUTES
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('profile') 
  async getProfile(@Req() req) {
    const ownerId = req.user.sub;
    return await this.usersService.getProfile(ownerId);
  }

  @UseGuards(RolesGuard)
  @Put('profile')
  async editProfile(@Req() req, @Body() updateDto: any) {
    return await this.usersService.editProfile(req.user.sub, updateDto);
  }

  @UseGuards(RolesGuard)
  @Get('by-owner')
  @Roles(UserRole.OWNER)
  async getWorkersByOwner(@Req() req) {
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
  @Get('manager/site-and-workers')
  @Roles(UserRole.CONSTRUCTION_MANAGER)
  async getManagerSiteAndWorkers(@Req() req) {
    const managerId = req.user.sub;
    return this.usersService.getSiteAndWorkersForManager(managerId);
  }

  // PARAMETERIZED ROUTES COME LAST
  @Get(':id')
  async findById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findById(id);
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
  @Put('edit-worker/:workerId')
  @Roles(UserRole.OWNER)
  async editWorker(@Param('workerId') workerId: string, @Body() updateDto: any, @Req() req) {
    const ownerId = req.user.sub;
    return await this.usersService.editWorker(workerId, updateDto, ownerId);
  }

  @UseGuards(RolesGuard)
  @Delete('delete-worker/:workerId')
  @Roles(UserRole.OWNER)
  async deleteWorker(@Param('workerId') workerId: string, @Req() req) {
    const ownerId = req.user.sub;
    return await this.usersService.deleteWorker(workerId, ownerId);
  }

  @UseGuards(RolesGuard)
  @Put('depromote-manager/:managerId')
  @Roles(UserRole.OWNER)
  async depromoteManagerToWorker(@Param('managerId') managerId: string, @Req() req) {
    const ownerId = req.user.sub;
    return await this.usersService.depromoteManagerToWorker(managerId, ownerId);
  }

    @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  @Post('reset-password-with-code')
  async resetPasswordWithCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPasswordWithCode(email, code, newPassword);
  }
}