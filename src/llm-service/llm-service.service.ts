import { Injectable, Logger } from '@nestjs/common';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import {
  generateText,
  stepCountIs,
  type AssistantModelMessage,
  type ModelMessage,
  type UserModelMessage,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { AiToolsService } from '../ai-tools/ai-tools.service';

@Injectable()
export class LlmServiceService {
  private readonly logger = new Logger(LlmServiceService.name);
  private readonly systemPrompt = `Eres un asistente virtual de citas médicas para el sistema Easyappointment. Tu objetivo es ayudar a pacientes a agendar, cancelar, modificar y consultar sus citas médicas a través de chat (Telegram/WhatsApp).
  Al dar respuesta no mandes formato de markdown, solo texto plano.

REGLAS DE INTERACCIÓN:
1. Responde de manera concisa y clara (máximo 2-3 oraciones por respuesta)
2. Usa lenguaje amigable y profesional
3. Pregunta solo la información necesaria: nombre del paciente, fecha/hora preferida, especialidad requerida, o nombre del médico pero sin que el usuario sienta que quieres rápido un formato.
4. Si no entiendes la solicitud, pide aclaraciones simples
5. No inventes información; si necesitas datos del sistema, usa las herramientas disponibles

HERRAMIENTAS DISPONIBLES:
- getAvailableDates: Úsala SIEMPRE cuando el usuario pregunte por disponibilidad de citas, horarios disponibles o fechas disponibles, no te olvides de formatear la respuesta para que sea más legible y fácil de entender.

FUNCIONES PRINCIPALES:
- Agendar nuevas citas
- Consultar disponibilidad de médicos
- Cancelar citas existentes
- Modificar citas pendientes
- Responder dudas sobre el proceso

EJEMPLOS DE RESPUESTAS:
"Para agendar tu cita necesito tu nombre completo y la especialidad que necesitas."
"Disponibilidad del Dr. Pérez: Lunes a Viernes 9:00-17:00"
"Tu cita está confirmada para el 15 de enero a las 14:00 con Dermatología."`;

  constructor(private readonly aiToolsService: AiToolsService) {}

  async chat(
    message: string,
    history?: Array<UserModelMessage | AssistantModelMessage>,
    patientId?: string,
    clinicId?: string,
    doctorId?: string,
  ) {
    this.logger.log('Chatting with LLM...');
    try {
      const historyMessages = history ?? [];
      const messages: ModelMessage[] = [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        ...historyMessages,
        {
          role: 'user',
          content: message,
        },
      ];
      const tools = {
        getAvailableDates: this.aiToolsService.getAvailabilityTool(),
        ...(patientId
          ? {
              changeUserName: this.aiToolsService.changeUserNameTool(patientId),
            }
          : {}),
        ...(patientId && clinicId && doctorId
          ? {
              createAppointment: this.aiToolsService.createAppointmentTool(
                patientId,
                doctorId,
                clinicId,
              ),
            }
          : {}),
      };

      const result = await generateText({
        messages,
        model: groq('openai/gpt-oss-20b'),
        tools,
        stopWhen: stepCountIs(2),
      });
      
      // Log detallado para debugging
      this.logger.log(`LLM response received. Text: ${result.text}`);
      if (result.toolCalls) {
        this.logger.log(`Tool calls made: ${JSON.stringify(result.toolCalls)}`);
      }
      if (result.toolResults) {
        this.logger.log(`Tool results: ${JSON.stringify(result.toolResults)}`);
      }
      
      return result.text;
    } catch (error) {
      this.logger.error(`Error en chat LLM: ${JSON.stringify(error)}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      // Manejo específico para errores de tools
      if (error.message && error.message.includes('tool')) {
        this.logger.error('Error detectado en ejecución de tool');
        return 'Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta nuevamente.';
      }
      
      handleErrors(error);
    }
  }
}
