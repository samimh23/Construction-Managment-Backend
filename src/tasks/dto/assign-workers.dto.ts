import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignWorkersDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  workerIds: string[];
}
