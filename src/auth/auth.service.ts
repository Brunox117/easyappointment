import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ValidRoles } from './interfaces/valid-roles';
import { handleErrors } from 'src/utilities/helpers/handle-errors';
import { CreateDoctorDto } from './dto/create-docto.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createDoctorUser(createUserDto: CreateDoctorDto) {
    try {
      this.logger.log('Creating doctor user...');
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        roles: [ValidRoles.doctor],
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userToReturn } = user;
      return {
        ...userToReturn,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.logger.error(error);
      handleErrors(error);
    }
  }

  checkAuthStatus(user: User) {
    this.logger.log('Checking auth status...');
    const { email, fullName } = user;
    return {
      email,
      fullName,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    this.logger.log('Attempting login...');
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user) throw new UnauthorizedException('Not valid credentials');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Not valid credentials');
    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
