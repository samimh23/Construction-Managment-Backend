import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { User } from 'src/users/schema/user.schema';
import { WorkSession } from './schema/work_session.schema';
import axios from 'axios';
import * as FormData from 'form-data';

// Use environment variable or fallback to localhost
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8002';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(WorkSession.name) private sessionModel: Model<WorkSession>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async checkIn(dto: CheckInDto) {
    const worker = await this.userModel.findOne({ workerCode: dto.workerCode });
    if (!worker) throw new NotFoundException('Worker not found.');

    const openSession = await this.sessionModel.findOne({
      worker: worker._id,
      checkOut: { $exists: false }
    });
    if (openSession) throw new BadRequestException('Already checked in.');

    return this.sessionModel.create({
      worker: worker._id,
      checkIn: new Date(),
      site: dto.siteId
    });
  }

  async checkOut(dto: CheckOutDto) {
    const worker = await this.userModel.findOne({ workerCode: dto.workerCode });
    if (!worker) throw new NotFoundException('Worker not found.');

    const openSession = await this.sessionModel.findOne({
      worker: worker._id,
      checkOut: { $exists: false }
    });
    if (!openSession) throw new NotFoundException('No open session found.');

    openSession.checkOut = new Date();
    return openSession.save();
  }

  async getDailyWorkSummaryById(workerId: string, from?: Date, to?: Date) {
  const match: any = { worker: new mongoose.Types.ObjectId(workerId) };
  if (from && to) {
    match.checkIn = { $gte: from, $lte: to };
  }

  const sessions = await this.sessionModel.aggregate([
    { $match: match },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$checkIn" } },
        duration: {
          $cond: [
            { $and: ["$checkOut", "$checkIn"] },
            { $divide: [{ $subtract: ["$checkOut", "$checkIn"] }, 1000 * 60 * 60] }, // hours
            0
          ]
        }
      },
    },
    {
      $group: {
        _id: "$date",
        totalHours: { $sum: "$duration" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return sessions.map(s => ({ date: s._id, totalHours: s.totalHours }));
}

  async registerFace(workerCode: string, photoBuffer: Buffer) {
    const worker = await this.userModel.findOne({ workerCode });
    if (!worker) throw new NotFoundException('Worker not found.');
    if (worker.faceRegistered) throw new BadRequestException('Face already registered.');

    const form = new FormData();
    form.append('worker_id', workerCode);
    form.append('file', photoBuffer, { filename: 'face.jpg' });

    try {
      const response = await axios.post(`${FASTAPI_URL}/register/`, form, {
        headers: form.getHeaders(),
      });
      const embedding = response.data.embedding;

      worker.faceEmbedding = embedding;
      worker.faceRegistered = true;
      await worker.save();

      return { message: `Face registered for ${workerCode}` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to connect to FastAPI (register face).');
    }
  }

async checkInWithFace(photoBuffer: Buffer, siteId: string) {
    const form = new FormData();
    form.append('file', photoBuffer, { filename: 'face.jpg' });

    try {
      const response = await axios.post(`${FASTAPI_URL}/recognize/`, form, {
        headers: form.getHeaders(),
      });

      const { worker_id, score } = response.data;
      if (!worker_id || score < 0.6) {
        throw new BadRequestException('Face not recognized or confidence too low.');
      }

      const worker = await this.userModel.findOne({ workerCode: worker_id });
      if (!worker) throw new NotFoundException('Worker not found.');
      if (!worker.faceRegistered) throw new BadRequestException('Worker face not registered.');

      const openSession = await this.sessionModel.findOne({
        worker: worker._id,
        checkOut: { $exists: false }
      });
      if (openSession) throw new BadRequestException('Already checked in.');

      return this.sessionModel.create({
        worker: worker._id,
        checkIn: new Date(),
        site: siteId
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to connect to FastAPI (face check-in).');
    }
  }

  /** Only photo needed for check-out */
  async checkOutWithFace(photoBuffer: Buffer) {
    const form = new FormData();
    form.append('file', photoBuffer, { filename: 'face.jpg' });

    try {
      const response = await axios.post(`${FASTAPI_URL}/recognize/`, form, {
        headers: form.getHeaders(),
      });

      const { worker_id, score } = response.data;
      if (!worker_id || score < 0.6) {
        throw new BadRequestException('Face not recognized or confidence too low.');
      }

      const worker = await this.userModel.findOne({ workerCode: worker_id });
      if (!worker) throw new NotFoundException('Worker not found.');
      if (!worker.faceRegistered) throw new BadRequestException('Worker face not registered.');

      const openSession = await this.sessionModel.findOne({
        worker: worker._id,
        checkOut: { $exists: false }
      });
      if (!openSession) throw new NotFoundException('No open session found.');

      openSession.checkOut = new Date();
      return openSession.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to connect to FastAPI (face check-out).');
    }
  }

  async getMonthlySalary(workerId: string, year: number, month: number) {
    // Get worker, including dailyWage
    const worker = await this.userModel.findById(workerId);
    if (!worker) throw new NotFoundException('Worker not found.');
    if (typeof worker.dailyWage !== 'number') throw new BadRequestException('Worker daily wage not set.');

    // Calculate month range
    // JS months: 0-indexed, but for Date use 1-indexed for easier calculations
    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // Last day of month

    // Use your existing aggregation to get total hours
    const match: any = {
      worker: new mongoose.Types.ObjectId(workerId),
      checkIn: { $gte: from, $lte: to }
    };

    const sessions = await this.sessionModel.aggregate([
      { $match: match },
      {
        $project: {
          duration: {
            $cond: [
              { $and: ["$checkOut", "$checkIn"] },
              { $divide: [{ $subtract: ["$checkOut", "$checkIn"] }, 1000 * 60 * 60] }, // hours
              0
            ]
          }
        }
      },
    ]);

    // Sum all durations
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const fullDays = totalHours / 8.0;
    const salary = fullDays * worker.dailyWage;

    return {
      year,
      month,
      totalHours: +totalHours.toFixed(2),
      fullDays: +fullDays.toFixed(2),
      dailyWage: worker.dailyWage,
      salary: +salary.toFixed(2)
    };
  }
}