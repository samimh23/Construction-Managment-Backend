import { Controller, Post, Body, Get, Query, Req, InternalServerErrorException } from '@nestjs/common';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AttendanceService } from './attendence.service';
import { FastifyRequest } from 'fastify';
import axios from 'axios';

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
  async registerFace(@Req() req: FastifyRequest) {
    const fileObj = (req.body as any).file;
    const workerCodeObj = (req.body as any).workerCode;

    if (!fileObj || !workerCodeObj?.value) {
      throw new InternalServerErrorException('Missing file or workerCode');
    }

    // Use toBuffer() for Fastify file
    const fileBuffer = await fileObj.toBuffer();

    return this.attendanceService.registerFace(workerCodeObj.value, fileBuffer);
  }

 @Post('checkin-face')
async checkInWithFace(@Req() req: FastifyRequest) {
  const fileObj = (req.body as any).file;
  const siteIdObj = (req.body as any).siteId;

  if (!fileObj || !siteIdObj?.value) {
    throw new InternalServerErrorException('Missing file or siteId');
  }

  // Use Fastify's built-in toBuffer
  const fileBuffer = await fileObj.toBuffer();

  console.log('buffer length:', fileBuffer.length);

  return this.attendanceService.checkInWithFace(fileBuffer, siteIdObj.value);
}

  @Post('checkout-face')
  async checkOutWithFace(@Req() req: FastifyRequest) {
    const fileObj = (req.body as any).file;

    if (!fileObj) {
      throw new InternalServerErrorException('Missing file');
    }

    // Use toBuffer() for Fastify file
    const fileBuffer = await fileObj.toBuffer();

    return this.attendanceService.checkOutWithFace(fileBuffer);
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

  @Get('test-fastapi')
  async testFastApi() {
    const FASTAPI_URL = process.env.FASTAPI_URL;
    console.log('FASTAPI_URL:', FASTAPI_URL);
    try {
      const resp = await axios.get(FASTAPI_URL);
      return resp.data;
    } catch (error) {
      console.error('AXIOS ERROR:', error?.response?.data || error.message || error);
      throw new InternalServerErrorException('Failed to connect to FastAPI.');
    }
  }
}