import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,      // Your Gmail address
        pass: process.env.GMAIL_APP_PASS,  // Your Gmail App Password
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
  }
}