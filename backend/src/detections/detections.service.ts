import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType, DetectionResult } from '@prisma/client';
import { AIServiceClient } from '../ai-service/ai-service.client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class DetectionsService {
  constructor(
    private prisma: PrismaService,
    private aiServiceClient: AIServiceClient,
  ) {}

  async create(userId: string, data: {
    fileName: string;
    mediaType: MediaType;
    imageBuffer?: Buffer;
  }) {
    // Only allow IMAGE media type for now
    if (data.mediaType !== MediaType.IMAGE) {
      throw new BadRequestException('Only image files are currently supported');
    }

    if (!data.imageBuffer) {
      throw new BadRequestException('Image buffer is required');
    }

    // Save image temporarily
    const tempDir = os.tmpdir();
    //const tempFilePath = path.join(tempDir, `detection_${Date.now()}_${data.fileName}`);
    
    try {
      //fs.writeFileSync(tempFilePath, data.imageBuffer);

      // Call AI service for prediction
      const prediction = await this.aiServiceClient.predictFromBuffer(
        data.imageBuffer,
        data.fileName,
      );
      // Map prediction to DetectionResult enum
      const result: DetectionResult = prediction.predicted_class === 'fake' 
        ? DetectionResult.FAKE 
        : DetectionResult.REAL;

      // Store result in database
      const detection = await this.prisma.detection.create({
        data: {
          userId,
          fileName: data.fileName,
          mediaType: data.mediaType,
          result: result,
          confidence: prediction.confidence,
        },
      });

      return detection;
    } finally {
      // Clean up temporary file
      //if (fs.existsSync(tempFilePath)) {
        //fs.unlinkSync(tempFilePath);
      //}
    }
  }

  async findAll(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.detection.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
    }
    return this.prisma.detection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const detection = await this.prisma.detection.findUnique({
      where: { id },
    });

    if (!detection) {
      throw new NotFoundException('Detection not found');
    }

    if (!isAdmin && detection.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return detection;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const detection = await this.prisma.detection.findUnique({
      where: { id },
    });

    if (!detection) {
      throw new NotFoundException('Detection not found');
    }

    if (!isAdmin && detection.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.detection.delete({
      where: { id },
    });
  }
}
