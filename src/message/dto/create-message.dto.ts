import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  fromPatient: boolean;
}
