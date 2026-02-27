import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { email, password, username } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new UnauthorizedException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
      isVerified: false,
    });

    await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please use OAuth login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  async oauthLogin(oauthDto: OAuthLoginDto): Promise<{ user: User; token: string }> {
    const { provider, providerId, email, username, avatar } = oauthDto;

    let user: User | null;

    // Find existing user by provider ID
    if (provider === 'google') {
      user = await this.userRepository.findOne({ where: { googleId: providerId } });
    } else if (provider === 'apple') {
      user = await this.userRepository.findOne({ where: { appleId: providerId } });
    } else {
      throw new UnauthorizedException('Invalid OAuth provider');
    }

    if (!user && email) {
      // Try to find by email
      user = await this.userRepository.findOne({ where: { email } });
    }

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email: email || `${providerId}@${provider}.placeholder`,
        username: username || `${provider}_${providerId.slice(0, 8)}`,
        avatar,
        googleId: provider === 'google' ? providerId : undefined,
        appleId: provider === 'apple' ? providerId : undefined,
        isVerified: true,
      });
      await this.userRepository.save(user);
    } else {
      // Update provider ID if not set
      if (provider === 'google' && !user.googleId) {
        user.googleId = providerId;
      } else if (provider === 'apple' && !user.appleId) {
        user.appleId = providerId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await this.userRepository.save(user);
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}