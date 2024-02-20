import { prismaClient } from '@/services/prisma';
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates';
import { Prisma, Gym } from "@prisma/client";
import { GymsRepository, IFindManyNearbyParams } from "../gyms-repository";

export class PrismaGymsRepository implements GymsRepository {
  public items: Gym[] = []

  async create(data: Prisma.GymUncheckedCreateInput) {
    const gym = await prismaClient.gym.create({
      data
    })

    return gym
  }

  async findById(id: string) {
    const gym = await prismaClient.gym.findUnique({
      where: {
        id
      }
    })

    return gym
  }

  async findMany(query: string, page: number) {
    const gyms = await prismaClient.gym.findMany({
      where: {
        name: {
          contains: query
        }
      },
      take: 20,
      skip: (page - 1) * 20
    })

    return gyms;
  }

  async findManyNearby({ userLatitude, userLongitude }: IFindManyNearbyParams) {
    const gyms = await prismaClient.$queryRaw<Gym[]>`
      SELECT * FROM gyms
      WHERE ( 6371 * acos( cos( radians(${userLatitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${userLongitude}) ) + sin( radians(${userLatitude}) ) * sin( radians( latitude ) ) ) ) <= 10
    `

    return gyms;
  }
}