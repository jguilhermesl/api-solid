import { CheckInsRepository } from "@/repositories/checkins-repository";
import { CheckIn } from "@prisma/client";

interface FetchUserCheckInsHistoryUseCaseRequest {
  userId: string,
  page: number
}

interface FetchUserCheckInsHistoryUseCaseResponse {
  checkins: CheckIn[]
}

export class FetchUserCheckInsHistoryUseCase {
  constructor(
    private checkinsRepository: CheckInsRepository
  ) { }

  async execute({ userId, page }: FetchUserCheckInsHistoryUseCaseRequest): Promise<FetchUserCheckInsHistoryUseCaseResponse> {
    const checkins = await this.checkinsRepository.findByUserId(userId, page)

    return { checkins };
  }
}