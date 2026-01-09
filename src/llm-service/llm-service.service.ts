import { Injectable, Logger } from '@nestjs/common';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

@Injectable()
export class LlmServiceService {
  private readonly logger = new Logger(LlmServiceService.name);
  async chat(message: string) {
    this.logger.log('Chatting with LLM...');
    try {
      const result = await generateText({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        model: groq('openai/gpt-oss-20b'),
      });
      console.log(result);
      return result.text;
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }
}
