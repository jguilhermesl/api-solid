import { GymsRepository } from '@/repositories/gyms-repository';

interface FetchNearbyGymsUseCaseRequest {
  userLatitude: number,
  userLongitude: number
}

export class FetchNearbyGymsUseCase {
  constructor(private gymsRepository: GymsRepository) { }

  async execute({ userLatitude, userLongitude }: FetchNearbyGymsUseCaseRequest) {
    const gyms = await this.gymsRepository.findManyNearby({ userLatitude, userLongitude })

    return { gyms }
  }
}