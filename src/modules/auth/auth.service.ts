import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginInput } from './dtos/login.dto';
import { AppError } from '../../core/exceptions/AppError';
import { User } from './entities/User';
import { env } from '../../core/config/env';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async login(payload: LoginInput): Promise<{ user: Pick<User, 'id' | 'username' | 'nip' | 'name'>; token: string }> {
    const { identifier, password } = payload;

    // 1. Find user by username or nip
    const user = await this.authRepository.findUserByIdentifier(identifier);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // 3. Generate JWT
    const token = jwt.sign({ userId: user.id, username: user.username, nip: user.nip }, env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        nip: user.nip,
        name: user.name,
      },
      token,
    };
  }
}
