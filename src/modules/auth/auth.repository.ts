import prisma from '../../core/utils/prismaClient';
import { User } from './entities/User';

export class AuthRepository {
  async findUserByIdentifier(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { nip: identifier },
        ],
      },
    });
  }
}
