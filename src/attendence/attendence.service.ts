import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { User } from 'src/users/schema/user.schema';
import { WorkSession } from './schema/work_session.schema';
import axios from 'axios';
import * as FormData from 'form-data';
import { ConstructionSite } from 'src/construction_sites/Schemas/Construction_Site.schema';

// Use environment variable or fallback to localhost
const FASTAPI_URL = process.env.FASTAPI_URL ;

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(WorkSession.name) private sessionModel: Model<WorkSession>,
    @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(ConstructionSite.name) private siteModel: Model<ConstructionSite>, // Make sure Site is registered in your module!

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

  // Make sure dto.siteId is provided
  if (!dto.siteId) throw new BadRequestException('siteId is required for check-out.');

  // Find open session for this worker at this site
  const openSession = await this.sessionModel.findOne({
    worker: worker._id,
    site: dto.siteId,
    checkOut: { $exists: false }
  });
  if (!openSession) throw new NotFoundException('No open session found for this site.');

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
    const FASTAPI_URL = process.env.FASTAPI_URL ;
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
      const FASTAPI_URL = process.env.FASTAPI_URL ;

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
      const FASTAPI_URL = process.env.FASTAPI_URL ;

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
    const worker = await this.userModel.findById(workerId);
    if (!worker) throw new NotFoundException('Worker not found.');
    if (typeof worker.dailyWage !== 'number') throw new BadRequestException('Worker daily wage not set.');

    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // Last day of month

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

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const fullDays = totalHours / 8.0;
    const salary = fullDays * worker.dailyWage;
    const roundedSalary = +salary.toFixed(2);

    // Fix: If salary is less than 0.01, make it zero
    return {
      year,
      month,
      totalHours: +totalHours.toFixed(2),
      fullDays: +fullDays.toFixed(2),
      dailyWage: worker.dailyWage,
      salary: roundedSalary < 0.02 ? 0 : roundedSalary
    };
  }

async getDashboardSummaryForOwner(ownerId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Get all sites owned by owner, include manager and workers
    const sites = await this.siteModel.find({ owner: ownerId }).select('_id manager workers');

    // 2. Collect all worker IDs (workers array + manager field)
    const workerIdsSet = new Set<string>();
    for (const site of sites) {
        if (site.manager) workerIdsSet.add(site.manager.toString());
        if (Array.isArray(site.workers)) {
            for (const w of site.workers) workerIdsSet.add(w.toString());
        }
    }
    const workerIds = Array.from(workerIdsSet);

    // 3. Get all users (workers and managers) by ID who are active
    const users = await this.userModel.find({
      _id: { $in: workerIds },
      role: { $in: ['worker', 'manager'] },
      isActive: true
    }).select('_id');
    const filteredWorkerIds = users.map(w => w._id);
    const totalWorkers = filteredWorkerIds.length;

    // 4. Today's Attendance
    const todayAttendanceAgg = await this.sessionModel.aggregate([
      { $match: {
          worker: { $in: filteredWorkerIds },
          checkIn: { $gte: startOfToday, $lte: now }
      }},
      { $group: { _id: "$worker" } },
      { $count: "presentCount" }
    ]);
    const presentTodayCount = todayAttendanceAgg[0]?.presentCount || 0;
    const absentTodayCount = totalWorkers - presentTodayCount;
    const todayAttendancePercent = totalWorkers === 0 ? 0 : Math.round((presentTodayCount / totalWorkers) * 100);

    // 5. Monthly Attendance
    const monthAttendanceAgg = await this.sessionModel.aggregate([
      { $match: {
          worker: { $in: filteredWorkerIds },
          checkIn: { $gte: startOfMonth, $lte: endOfMonth }
      }},
      { $group: { _id: "$worker" } },
      { $count: "presentCount" }
    ]);
    const presentMonthCount = monthAttendanceAgg[0]?.presentCount || 0;
    const absentMonthCount = totalWorkers - presentMonthCount;
    const monthAttendancePercent = totalWorkers === 0 ? 0 : Math.round((presentMonthCount / totalWorkers) * 100);

    // 6. Weekly Trends (aggregation per day)
    const weeklyTrend: { date: string, percent: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const dayAgg = await this.sessionModel.aggregate([
        { $match: {
            worker: { $in: filteredWorkerIds },
            checkIn: { $gte: dayStart, $lt: dayEnd }
        }},
        { $group: { _id: "$worker" } },
        { $count: "presentCount" }
      ]);
      const presentCount = dayAgg[0]?.presentCount || 0;
      weeklyTrend.push({
        date: dayStart.toISOString().slice(0, 10),
        percent: totalWorkers === 0 ? 0 : Math.round((presentCount / totalWorkers) * 100)
      });
    }

    return {
      today: {
        totalWorkers,
        present: presentTodayCount,
        absent: absentTodayCount,
        percent: todayAttendancePercent
      },
      month: {
        totalWorkers,
        present: presentMonthCount,
        absent: absentMonthCount,
        percent: monthAttendancePercent
      },
      weeklyTrend
    };
}

async getSiteDailyAttendance(siteId: string) {
    const now = new Date();
const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    // Get the site document to find all workers and manager
    const site = await this.siteModel.findById(siteId).select('workers manager');

    // Collect all assigned user IDs (workers array + manager field)
    const assignedUserIds = [
      ...(site.workers ? site.workers.map(w => w.toString()) : []),
      ...(site.manager ? [site.manager.toString()] : [])
    ];
    console.log('Assigned User IDs:', assignedUserIds);

    // Get user details (active, role worker or manager)
    const users = await this.userModel.find({
      _id: { $in: assignedUserIds },
      role: { $in: ['worker', 'manager'] },
      isActive: true
    }).select('_id firstName lastName dailyWage workerCode');
    console.log('Active Users:', users);

    const workerIds = users.map(u => u._id);

    // Find sessions for today and this site
    const presentSessions = await this.sessionModel.find({
      worker: { $in: workerIds },
      site: siteId,
      checkIn: { $gte: startOfToday, $lte: now }
    }).select('worker');
    console.log('Present Sessions:', presentSessions);

    const presentWorkerIds = new Set(presentSessions.map(s => s.worker.toString()));
    console.log('Present Worker IDs:', presentWorkerIds);

    // Split present and absent users
    const presentWorkers = users.filter(w => presentWorkerIds.has(w._id.toString()));
    const absentWorkers = users.filter(w => !presentWorkerIds.has(w._id.toString()));

    console.log('Present Workers:', presentWorkers);
    console.log('Absent Workers:', absentWorkers);

    return {
      siteId,
      presentCount: presentWorkers.length,
      absentCount: absentWorkers.length,
      present: presentWorkers.map(w => ({
        id: w._id,
        name: `${w.firstName} ${w.lastName}`,
        dailyWage: w.dailyWage,
        workerCode: w.workerCode,
      })),
      absent: absentWorkers.map(w => ({
        id: w._id,
        name: `${w.firstName} ${w.lastName}`,
        dailyWage: w.dailyWage,
        workerCode: w.workerCode,
      })),
    };
}
  // Add this method to AttendanceService


   async testFastApiConnectivity() {
    try {
      const resp = await axios.get(`${FASTAPI_URL}`);
      console.log('FastAPI connectivity OK:', resp.status, resp.data);
      return { status: resp.status, data: resp.data };
    } catch (err) {
      console.error('FastAPI connectivity FAILED:', err.message);
      if (err.response) {
        console.error('Response:', err.response.status, err.response.data);
      }
      throw new InternalServerErrorException('Failed to connect to FastAPI.');
    }
  }
async getTodayAttendanceForWorker(workerId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  // Check worker exists
  const worker = await this.userModel.findById(workerId).select('isActive');
  if (!worker) throw new NotFoundException('Worker not found.');
  if (!worker.isActive) throw new BadRequestException('Worker is not active.');

  // Find ALL today's sessions (not just one)
  const sessions = await this.sessionModel
    .find({
      worker: worker._id,
      checkIn: { $gte: startOfToday, $lt: endOfToday }
    })
    .sort({ checkIn: 1 }); // Sort by check-in time ascending

  if (!sessions || sessions.length === 0) {
    return {
      status: 'Absent',
      sessions: []
    };
  }

  // Map all sessions
  const mappedSessions = sessions.map(session => ({
    checkIn: session.checkIn,
    checkOut: session.checkOut || null,
    status: session.checkOut ? 'Checked Out' : 'Present'
  }));

  // Overall status: if any session is still open (no checkOut), worker is Present
  const hasOpenSession = sessions.some(s => !s.checkOut);
  const status = hasOpenSession ? 'Present' : 'Checked Out';

  return {
    status,
    sessions: mappedSessions
  };
}



  
}