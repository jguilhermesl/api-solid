import { prismaClient } from '@/services/prisma';
import { Prisma } from "@prisma/client";
import { UsersRepository } from '../users-repository';

export class PrismaUsersRepository implements UsersRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prismaClient.user.create({
      data
    })

    return user
  }

  async findById(id: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        id
      }
    })

    return user
  }

  async findByEmail(email: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        email
      }
    })

    return user
  }
}