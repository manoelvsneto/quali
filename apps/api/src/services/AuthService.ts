import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class AuthService {
  constructor(private userRepo: UserRepository) {}
  
  async register(name: string, email: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ValidationError('Email already registered');
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      name,
      email,
      passwordHash,
      roles: ['user'],
    });
    
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }
  
  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }
  
  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(payload.userId);
    
    if (!user) {
      throw new UnauthorizedError('Invalid token');
    }
    
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });
    
    return { accessToken, refreshToken: newRefreshToken };
  }
  
  async me(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }
}
