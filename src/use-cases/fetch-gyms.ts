import { GymsRepository } from '@/repositories/gyms-repository';

interface FetchGymsUseCaseRequest {
  query: string,
  page: number
}

export class FetchGymsUseCase {
  constructor(private gymsRepository: GymsRepository) { }

  async execute({ query, page }: FetchGymsUseCaseRequest) {
    const gyms = await this.gymsRepository.findMany(query, page)

    return { gyms }
  }
}