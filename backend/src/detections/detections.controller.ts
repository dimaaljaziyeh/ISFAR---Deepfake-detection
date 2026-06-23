import { Controller, Get, Post, Delete, UseGuards, Request, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectionsService } from './detections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDetectionDto } from './dto/create-detection.dto';
import { MediaType } from '@prisma/client';

@ApiTags('detections')
@Controller('detections')
export class DetectionsController {
  constructor(private detectionsService: DetectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new detection' })
  async create(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const createDetectionDto: CreateDetectionDto = {
      fileName: file.originalname,
      mediaType: MediaType.IMAGE,
    };

    return this.detectionsService.create(req.user.userId, {
      ...createDetectionDto,
      imageBuffer: file.buffer,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all detections (user own or all if admin)' })
  async findAll(@Request() req) {
    const isAdmin = req.user.roles?.includes('ADMIN');
    return this.detectionsService.findAll(req.user.userId, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a detection' })
  async remove(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.roles?.includes('ADMIN');
    return this.detectionsService.remove(id, req.user.userId, isAdmin);
  }
}
