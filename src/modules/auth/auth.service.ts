import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { v4 } from 'uuid';

import { ActivateUserDto } from './dto/activate-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EncoderService } from './encoder/encoder.service';
import { User } from './entities/auth.entity';
import { JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private authModel: typeof User,

    private encoderService: EncoderService,

    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const { password } = createAuthDto;
      const plainTextToHash = await this.encoderService.encodePassword(
        password,
      );
      const user = await this.authModel.create({
        ...createAuthDto,
        password: plainTextToHash,
        activationToken: v4(),
      });

      return user.toJSON();
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('This email is already registered');
      }

      console.log({ ERROR: error.message, error });
      throw new InternalServerErrorException();
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.findByEmail(loginAuthDto.email);

    if (user.isRegisteredWithGoogle)
      throw new UnauthorizedException(
        'This account is already associated with the google provider',
      );

    const checkPassword = await this.encoderService.checkPassword(
      loginAuthDto.password,
      user.password,
    );

    if (!checkPassword) {
      throw new UnauthorizedException('Please check your credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException('Please verify your account');
    }

    const { id, email, active, username, isRegisteredWithGoogle } = user;

    const payload: JwtPayload = {
      id,
      email,
      active,
    };
    const accessToken = await this.jwtService.sign(payload);

    const parsedUser = {
      id,
      username,
      email,
      active,
      isRegisteredWithGoogle,
    };
    return {
      user: parsedUser,
      jwt: { accessToken },
    };
  }

  async activateUser(activateUserDto: ActivateUserDto): Promise<void> {
    const { id, code } = activateUserDto;
    const user: User = await this.findOneInactiveByIdActivationToken(id, code);
    if (!user)
      throw new UnprocessableEntityException('This action can not be done');

    await this.authModel.update(
      { ...user, active: true, activationToken: null },
      {
        where: { id: user.id },
      },
    );
  }

  async findOneInactiveByIdActivationToken(id: string, code: string) {
    return await this.authModel.findOne({
      where: { id, activationToken: code, active: false },
    });
  }

  async findByEmail(email: string): Promise<User> {
    const user: User = await this.authModel.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`user with email: ${email} not found`);
    }

    return user.toJSON();
  }

  async requestResetPassword(
    requestResetPassword: RequestResetPasswordDto,
  ): Promise<void> {
    const { email } = requestResetPassword;
    const user: User = await this.findByEmail(email);

    this.authModel.update(
      { ...user, resetPasswordToken: v4() },
      { where: { id: user.id } },
    );
    // send email(e.g Dispatch an event so MailerModule can send the email  )
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { resetPasswordToken, password } = resetPasswordDto;
    const user: User = await this.findOneByResetPasswordToken(
      resetPasswordToken,
    );

    const newPassword = await this.encoderService.encodePassword(password);

    this.authModel.update(
      { ...user, password: newPassword, resetPasswordToken: null },
      { where: { id: user.id } },
    );
  }

  async findOneByResetPasswordToken(resetPasswordToken: string): Promise<User> {
    const user: User = await this.authModel.findOne({
      where: { resetPasswordToken },
    });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: User,
  ): Promise<void> {
    const { oldPassword, newPassword } = changePasswordDto;

    const isValid = await this.encoderService.checkPassword(
      oldPassword,
      user.password,
    );

    if (!isValid) {
      throw new BadRequestException('old password does not match');
    }

    const hashPassword = await this.encoderService.encodePassword(newPassword);
    await this.authModel.update(
      { ...user, password: hashPassword },
      { where: { id: user.id } },
    );
  }
}
