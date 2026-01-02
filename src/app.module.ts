import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicModule } from './clinic/clinic.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { WaIntegrationModule } from './wa-integration/wa-integration.module';
import { AiToolsModule } from './ai-tools/ai-tools.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClinicModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    ConversationModule,
    MessageModule,
    WaIntegrationModule,
    AiToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
