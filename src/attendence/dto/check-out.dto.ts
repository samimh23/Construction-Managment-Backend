import { IsString } from "class-validator";

export class CheckOutDto {
  workerCode: string;
  siteId: string;
}