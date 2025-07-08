import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { User } from 'src/users/schema/user.schema';
import { WorkSession } from './schema/work_session.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(WorkSession.name) private sessionModel: Model<WorkSession>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async checkIn(dto: CheckInDto) {
    // 1. Find worker by workerCode
    const worker = await this.userModel.findOne({ workerCode: dto.workerCode });
    if (!worker) throw new NotFoundException('Worker not found.');

    // 2. Prevent double check-in
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

  // ...other methods unchanged


  async getDailyWorkSummaryById(workerId: string, from?: Date, to?: Date) {
  // Build match condition
  const match: any = { worker: workerId };
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
            { $and: [ "$checkOut", "$checkIn" ] },
            { $divide: [ { $subtract: [ "$checkOut", "$checkIn" ] }, 1000 * 60 * 60 ] }, // hours
            0
          ]
        }
      }
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
}