import { prismaClient } from './../../services/prisma';
import { CheckIn, Prisma } from "@prisma/client";
import { CheckInsRepository } from "../checkins-repository";
import dayjs = require('dayjs');

export class PrismaCheckInsRepository implements CheckInsRepository {
  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkin = await prismaClient.checkIn.create({
      data
    })

    return checkin
  }

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date')
    const endOfTheDay = dayjs(date).endOf('date')

    const checkIn = await prismaClient.checkIn.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfTheDay.toDate(),
          lte: endOfTheDay.toDate()
        }
      }
    })


    return checkIn
  }

  async findByUserId(userId: string, page: number) {
    const checkins = await prismaClient.checkIn.findMany({
      where: {
        id: userId
      },
      take: 20,
      skip: (page - 1) * 20
    })

    return checkins
  }

  async findById(id: string) {
    const checkin = await prismaClient.checkIn.findUnique({
      where: {
        id
      }
    })

    if (!checkin) {
      return null
    }

    return checkin
  }
  async save(checkIn: CheckIn) {
    const checkin = await prismaClient.checkIn.update({
      where: {
        id: checkIn.id
      },
      data: checkIn
    })

    return checkin
  }

}