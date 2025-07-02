import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { AccessCode, AccessCodeDocument } from './schemas/acces-code.schema';

@Injectable()
export class CodesService {
  constructor(
    @InjectModel(AccessCode.name) private accessCodeModel: Model<AccessCodeDocument>
  ) {}

  async generateCode(managerId: string, siteId: string, createdBy: string): Promise<AccessCode> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Code expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Deactivate existing codes for this manager
    await this.accessCodeModel.updateMany(
      { manager: managerId, isUsed: false },
      { isUsed: true }
    );

    const accessCode = new this.accessCodeModel({
      code,
      manager: managerId,
      site: siteId,
      expiresAt,
      createdBy,
    });

    return accessCode.save();
  }

  async validateCode(code: string): Promise<AccessCodeDocument | null> {
    const accessCode = await this.accessCodeModel.findOne({
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).populate('manager').populate('site');

    return accessCode;
  }

  async markCodeAsUsed(codeId: string): Promise<void> {
    await this.accessCodeModel.findByIdAndUpdate(codeId, { isUsed: true });
  }

  async getActiveCode(managerId: string): Promise<AccessCode | null> {
    return this.accessCodeModel.findOne({
      manager: managerId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  }
}