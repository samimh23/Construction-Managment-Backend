import { IsString } from "class-validator";

export class CheckOutDto {
  @IsString()
  workerCode: string;
}