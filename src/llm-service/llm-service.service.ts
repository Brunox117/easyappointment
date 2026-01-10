import { Injectable, Logger } from '@nestjs/common';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { AiToolsService } from '../ai-tools/ai-tools.service';

@Injectable()
export class LlmServiceService {
  private readonly logger = new Logger(LlmServiceService.name);
  private readonly systemPrompt = `Eres un asistente virtual de citas médicas para el sistema Easyappointment. Tu objetivo es ayudar a pacientes a agendar, cancelar, modificar y consultar sus citas médicas a través de chat (Telegram/WhatsApp).

REGLAS DE INTERACCIÓN:
1. Responde de manera concisa y clara (máximo 2-3 oraciones por respuesta)
2. Usa lenguaje amigable y profesional
3. Pregunta solo la información necesaria: nombre del paciente, fecha/hora preferida, especialidad requerida, o nombre del médico
4. Si no entiendes la solicitud, pide aclaraciones simples
5. No inventes información; si necesitas datos del sistema, usa las herramientas disponibles

HERRAMIENTAS DISPONIBLES:
- getAvailableDates: Úsala SIEMPRE cuando el usuario pregunte por disponibilidad de citas, horarios disponibles o fechas disponibles

INFORMACIÓN DEL SISTEMA:
- Estructura: Organization > Clinic > Doctor (con Availability) > Patient > Appointment
- Puedes gestionar citas, horarios de doctores, disponibilidad y pacientes
- Cada acción genera registros en Conversation > Message y AIAction

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

  async chat(message: string) {
    this.logger.log('Chatting with LLM...');
    try {
      const result = await generateText({
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        model: groq('openai/gpt-oss-20b'),
        tools: {
          getAvailableDates: this.aiToolsService.getAvailabilityTool(),
        },
      });
      console.log(result);
      return result.text;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
