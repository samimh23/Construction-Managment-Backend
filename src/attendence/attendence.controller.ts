  import { Controller, Post, Body, Get, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
  import { CheckInDto } from './dto/check-in.dto';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { CheckOutDto } from './dto/check-out.dto';
  import { AttendanceService } from './attendence.service';

  @Controller('attendance')
  export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post('check-in')
    async checkIn(@Body() dto: CheckInDto) {
      return this.attendanceService.checkIn(dto);
    }

    @Post('check-out')
    async checkOut(@Body() dto: CheckOutDto) {
      return this.attendanceService.checkOut(dto);
    }

        @Get('daily-summary')
        async getDailySummary(
          @Query('workerId') workerId: string,
          @Query('from') from?: string,
          @Query('to') to?: string
        ) {
          return this.attendanceService.getDailyWorkSummaryById(
            workerId,
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined
          );
        }

    @Post('register-face')
    @UseInterceptors(FileInterceptor('file'))
    async registerFace(
      @UploadedFile() file: Express.Multer.File,
      @Body('workerCode') workerCode: string
    ) {
      return this.attendanceService.registerFace(workerCode, file.buffer);
    }

    @Post('checkin-face')
    @UseInterceptors(FileInterceptor('file'))
    async checkInWithFace(
      @UploadedFile() file: Express.Multer.File,
      @Body('siteId') siteId: string
    ) {
      // siteId must be sent in the form-data
      return this.attendanceService.checkInWithFace(file.buffer, siteId);
    }

    @Post('checkout-face')
    @UseInterceptors(FileInterceptor('file'))
    async checkOutWithFace(
      @UploadedFile() file: Express.Multer.File
    ) {
      return this.attendanceService.checkOutWithFace(file.buffer);
    }

      @Get('monthly-salary')
  async getMonthlySalary(
    @Query('workerId') workerId: string,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    return this.attendanceService.getMonthlySalary(
      workerId,
      parseInt(year, 10),
      parseInt(month, 10)
    );
  }
  }