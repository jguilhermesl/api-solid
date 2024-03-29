import { Prisma, CheckIn } from "@prisma/client";
import dayjs = require("dayjs");
import { randomUUID } from "node:crypto";
import { CheckInsRepository } from "../checkins-repository";

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      userId: data.userId,
      gymId: data.gymId,
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : null,
      createdAt: new Date()
    }

    this.items.push(checkIn)

    return checkIn
  }

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date')
    const endOfTheDay = dayjs(date).endOf('date')

    const checkinOnSameDate = this.items.find(checkIn => {
      const checkInDate = dayjs(checkIn.createdAt)
      const isOnSameDate = checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay)

      return checkIn.userId === userId && isOnSameDate
    })

    if (!checkinOnSameDate) {
      return null
    }

    return checkinOnSameDate
  }

  async findByUserId(userId: string, page: number): Promise<CheckIn[]> {
    return this.items
      .filter((checkin) => checkin.userId === userId)
      .slice((page - 1) * 20, page * 20)
  }

  async findById(id: string) {
    const checkin = this.items.find((item) => item.id === id)

    if (!checkin) {
      return null
    }

    return checkin
  }

  async save(checkIn: CheckIn) {
    const checkInIndex = this.items.findIndex(item => item.id === checkIn.id)

    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn
    }

    return checkIn
  }
}