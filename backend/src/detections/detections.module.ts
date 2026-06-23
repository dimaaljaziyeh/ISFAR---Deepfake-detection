import { Module } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';
import { AIServiceClient } from '../ai-service/ai-service.client';

@Module({
  controllers: [DetectionsController],
  providers: [DetectionsService, AIServiceClient],
})
export class DetectionsModule {}
