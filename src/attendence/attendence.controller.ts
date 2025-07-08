import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CheckInDto } from './dto/check-in.dto';
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

  // Optional: fetch all sessions for a worker by code and date range
  

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
}