import { Injectable, Logger } from '@nestjs/common';
import { tool } from 'ai';
import { z } from 'zod';

@Injectable()
export class AiToolsService {
  private readonly logger = new Logger(AiToolsService.name);

  getAvailabilityTool() {
    return tool({
      description:
        'Obtiene las fechas y horarios disponibles para agendar citas médicas',
      inputSchema: z.object({
        specialty: z
          .string()
          .optional()
          .describe('Especialidad médica requerida'),
        doctorName: z
          .string()
          .optional()
          .describe('Nombre del médico (opcional)'),
      }),
      execute: ({ specialty, doctorName }) => {
        this.logger.log(
          `Consultando disponibilidad para especialidad: ${specialty}, médico: ${doctorName}`,
        );

        return {
          availableDates: [
            {
              date: '2025-01-15',
              slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            },
            {
              date: '2025-01-16',
              slots: ['09:00', '10:00', '14:00', '15:00', '16:00'],
            },
            {
              date: '2025-01-17',
              slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
            },
          ],
          specialty: specialty || 'general',
          doctorName: doctorName || 'cualquier médico',
        };
      },
    });
  }
}
