import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// لا تضف أي استيراد لـ FormData أو Blob
// Node.js 24 يوفرهما تلقائياً

interface AIPredictionResponse {
  predicted_class: 'fake' | 'real';
  confidence: number;
  probabilities: {
    fake: number;
    real: number;
  };
}

@Injectable()
export class AIServiceClient {
  private readonly logger = new Logger(AIServiceClient.name);
  private readonly aiServiceUrl: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:5000';
    this.timeout = 120000;
  }

  async predict(imagePath: string): Promise<AIPredictionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const formData = new FormData();
      //formData.append('image', createReadStream(imagePath));

      this.logger.log(`Sending image to AI service: ${this.aiServiceUrl}/predict`);

      const response = await fetch(`${this.aiServiceUrl}/predict`, {
        method: 'POST',
        body: formData as any,
        signal: controller.signal,
        //headers: formData.getHeaders() as any,
      } as any);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`AI service error: ${response.status} - ${errorText}`);
        
        if (response.status === 400) {
          throw new BadRequestException('Invalid image format or corrupted image');
        }
        throw new InternalServerErrorException('AI service prediction failed');
      }

      const data = await response.json() as AIPredictionResponse;
      this.logger.log(`Prediction received: ${data.predicted_class} with confidence ${data.confidence}`);
      
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        this.logger.error('AI service request timed out');
        throw new InternalServerErrorException('AI service request timed out');
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`AI service communication error: ${error.message}`);
      throw new InternalServerErrorException('Failed to communicate with AI service');
    }
  }

  async predictFromBuffer(buffer: Buffer, fileName: string): Promise<AIPredictionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const formData = new FormData();

      const blob = new Blob(
        [new Uint8Array(buffer)],
        { type: 'image/jpeg' }
      );

      formData.append(
        'image',
        blob,
        fileName,
      );

      this.logger.log(
        `Sending image buffer to AI service: ${this.aiServiceUrl}/predict`,
      );

      const response = await fetch(
        `${this.aiServiceUrl}/predict`,
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`AI service error: ${response.status} - ${errorText}`);
        
        if (response.status === 400) {
          throw new BadRequestException('Invalid image format or corrupted image');
        }
        throw new InternalServerErrorException('AI service prediction failed');
      }

      const data = await response.json() as AIPredictionResponse;
      this.logger.log(`Prediction received: ${data.predicted_class} with confidence ${data.confidence}`);
      
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        this.logger.error('AI service request timed out');
        throw new InternalServerErrorException('AI service request timed out');
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`AI service communication error: ${error.message}`);
      throw new InternalServerErrorException('Failed to communicate with AI service');
    }
  }
}
