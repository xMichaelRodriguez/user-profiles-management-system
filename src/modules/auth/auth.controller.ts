import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { errorException } from './documentation/error-exception';
import { ActivateUserDto } from './dto/activate-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from './entities/auth.entity';
import { GoogleService } from './google/google.service';

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @ApiOkResponse({
    type: CreateAuthDto,
  })
  @ApiConflictResponse({
    type: errorException,
    description: 'This email is already registered',
  })
  @ApiInternalServerErrorResponse({
    type: errorException,
    description: 'Internal server Error',
  })
  @Post('/local/register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @ApiOkResponse({
    type: CreateAuthDto,
  })
  @ApiUnauthorizedResponse({
    type: errorException,
    description: 'Unauthorized Exception',
  })
  @ApiInternalServerErrorResponse({
    type: errorException,
    description: 'Internal server Error',
  })
  @ApiNotFoundResponse({
    type: errorException,
    description: 'NotFoundException',
  })
  @Post('/local/login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req) {
    return await this.googleService.prepareUserRegister(req);
  }

  @ApiOkResponse()
  @ApiUnauthorizedResponse({
    type: errorException,
    description: 'Unauthorized Exception',
  })
  @ApiInternalServerErrorResponse({
    type: errorException,
    description: 'Internal server Error',
  })
  @ApiNotFoundResponse({
    type: errorException,
    description: 'NotFoundException',
  })
  @Patch('/request-reset-password')
  requestResetPassword(
    @Body() requestResetPassword: RequestResetPasswordDto,
  ): Promise<void> {
    return this.authService.requestResetPassword(requestResetPassword);
  }

  @ApiOkResponse()
  @ApiUnauthorizedResponse({
    type: errorException,
    description: 'Unauthorized Exception',
  })
  @ApiInternalServerErrorResponse({
    type: errorException,
    description: 'Internal server Error',
  })
  @ApiNotFoundResponse({
    type: errorException,
    description: 'NotFoundException',
  })
  @Patch('/reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOkResponse({
    type: ChangePasswordDto,
  })
  @ApiUnauthorizedResponse({
    type: errorException,
    description: 'Unauthorized Exception',
  })
  @ApiInternalServerErrorResponse({
    type: errorException,
    description: 'Internal server Error',
  })
  @ApiNotFoundResponse({
    type: errorException,
    description: 'NotFoundException',
  })
  @Patch('/change-password')
  @UseGuards(AuthGuard())
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.authService.changePassword(changePasswordDto, user);
  }

  @Get('/activate-accounts')
  async activateAccount(@Query() activateUserDto: ActivateUserDto) {
    return await this.authService.activateUser(activateUserDto);
  }
}
