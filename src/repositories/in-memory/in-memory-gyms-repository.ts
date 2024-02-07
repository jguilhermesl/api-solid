import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates';
import { randomUUID } from 'node:crypto';
import { Prisma, Gym } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { GymsRepository, IFindManyNearbyParams } from "../gyms-repository";

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = []

  async create(data: Prisma.GymUncheckedCreateInput) {
    const gym: Gym = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      phone: data.phone as string,
      latitude: new Decimal(data.latitude.toString()),
      longitude: new Decimal(data.longitude.toString()),
    }

    this.items.push(gym);

    return gym
  }

  async findById(id: string) {
    const gym = this.items.find(item => item.id === id)

    if (!gym) {
      return null
    }

    return gym
  }

  async findMany(query: string, page: number) {
    let gyms;

    if (query) {
      gyms = this.items
        .filter((item) => item.name.includes(query))
        .slice((page - 1) * 20, page * 20)

      return gyms
    }

    gyms = this.items.slice((page - 1) * 20, page * 20);
    return gyms;
  }

  async findManyNearby(params: IFindManyNearbyParams) {
    const gyms = this.items.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        { latitude: params.userLatitude, longitude: params.userLongitude },
        { latitude: item.latitude.toNumber(), longitude: item.longitude.toNumber() }
      )

      return distance < 10;
    })

    return gyms;
  }
}