import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  patientId: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;
}
