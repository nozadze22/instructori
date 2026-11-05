import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import {
  CreateInstructorCodeDto,
  CreateProfileDto,
  JoinInstructorDto,
  UpdateProfileDto,
} from './dto/profile.dto';
import {
  CreateInstructorVehicleDto,
  UpdateInstructorVehicleDto,
} from './dto/instructor-vehicle.dto';
import {
  CreateInstructorTrainingStepDto,
  UpdateInstructorTrainingStepDto,
} from './dto/instructor-training-step.dto';
import {
  CreateInstructorCertificateDto,
  UpdateInstructorCertificateDto,
} from './dto/instructor-certificate.dto';
import type { UploadedImageFile } from '../../storage/uploaded-image.type';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: AuthUser) {
    return this.profileService.getProfile(user.userId);
  }

  @Post()
  createProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProfileDto,
  ) {
    return this.profileService.createProfile(user.userId, dto);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.userId, dto);
  }

  @Get('instructor-group')
  getInstructorGroup(@CurrentUser() user: AuthUser) {
    return this.profileService.getInstructorGroup(user.userId);
  }

  @Get('students')
  getStudents(@CurrentUser() user: AuthUser) {
    return this.profileService.getStudents(user.userId);
  }

  @Post('instructor-code')
  createInstructorCode(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInstructorCodeDto,
  ) {
    return this.profileService.createInstructorCode(
      user.userId,
      dto.rotate === true,
    );
  }

  @Post('instructor-group')
  joinInstructorGroup(
    @CurrentUser() user: AuthUser,
    @Body() dto: JoinInstructorDto,
  ) {
    return this.profileService.joinInstructorGroup(user.userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: UploadedImageFile,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.profileService.uploadAvatar(user.userId, file);
  }

  @Delete('avatar')
  removeAvatar(@CurrentUser() user: AuthUser) {
    return this.profileService.removeAvatar(user.userId);
  }

  @Get('vehicles')
  listMyVehicles(@CurrentUser() user: AuthUser) {
    return this.profileService.listMyVehicles(user);
  }

  @Post('vehicles')
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  createVehicle(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInstructorVehicleDto,
    @UploadedFiles() files: UploadedImageFile[],
  ) {
    return this.profileService.createVehicle(user, dto, files);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInstructorVehicleDto,
  ) {
    return this.profileService.updateVehicle(user, id, dto);
  }

  @Post('vehicles/:id/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  replaceVehiclePhoto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: UploadedImageFile,
  ) {
    return this.profileService.replaceVehiclePhoto(user, id, file);
  }

  @Delete('vehicles/:id')
  deleteVehicle(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.profileService.deleteVehicle(user, id);
  }

  @Get('training-steps')
  listMyTrainingSteps(@CurrentUser() user: AuthUser) {
    return this.profileService.listMyTrainingSteps(user);
  }

  @Post('training-steps')
  createTrainingStep(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInstructorTrainingStepDto,
  ) {
    return this.profileService.createTrainingStep(user, dto);
  }

  @Patch('training-steps/:id')
  updateTrainingStep(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInstructorTrainingStepDto,
  ) {
    return this.profileService.updateTrainingStep(user, id, dto);
  }

  @Delete('training-steps/:id')
  deleteTrainingStep(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.profileService.deleteTrainingStep(user, id);
  }

  @Get('certificates')
  listMyCertificates(@CurrentUser() user: AuthUser) {
    return this.profileService.listMyCertificates(user);
  }

  @Post('certificates')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  createCertificate(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInstructorCertificateDto,
    @UploadedFile() file: UploadedImageFile,
  ) {
    return this.profileService.createCertificate(user, dto, file);
  }

  @Patch('certificates/:id')
  updateCertificate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInstructorCertificateDto,
  ) {
    return this.profileService.updateCertificate(user, id, dto);
  }

  @Post('certificates/:id/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  replaceCertificatePhoto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: UploadedImageFile,
  ) {
    return this.profileService.replaceCertificatePhoto(user, id, file);
  }

  @Delete('certificates/:id')
  deleteCertificate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.profileService.deleteCertificate(user, id);
  }
}
