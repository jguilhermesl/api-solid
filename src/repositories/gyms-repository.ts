import { Gym, Prisma } from "@prisma/client";

export interface IFindManyNearbyParams {
  userLatitude: number,
  userLongitude: number
}

export interface GymsRepository {
  create(data: Prisma.GymCreateInput): Promise<Gym>,
  findById(gymId: string): Promise<Gym | null>,
  findMany(query: string, page: number): Promise<Gym[]>,
  findManyNearby(params: IFindManyNearbyParams): Promise<Gym[]>
}