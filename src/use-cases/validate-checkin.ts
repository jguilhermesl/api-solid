import { CheckInsRepository } from "@/repositories/checkins-repository";
import { CheckIn } from "@prisma/client";
import dayjs = require("dayjs");
import { LateCheckinValidationError } from "./errors/late-checkin-validation-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface ValidateCheckInUseCaseRequest {
  checkInId: string
}

interface ValidateCheckInUseCaseResponse {
  checkin: CheckIn
}

export class ValidateCheckInUseCase {
  constructor(
    private checkinsRepository: CheckInsRepository,
  ) { }

  async execute({ checkInId }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkin = await this.checkinsRepository.findById(checkInId)

    if (!checkin) {
      throw new ResourceNotFoundError()
    }

    const DISTANCE_IN_MINUTES_FROM_CHECKIN_CREATION = dayjs(new Date()).diff(
      checkin.createdAt,
      'minutes'
    )

    if (DISTANCE_IN_MINUTES_FROM_CHECKIN_CREATION > 20) {
      throw new LateCheckinValidationError;
    }

    checkin.validatedAt = new Date()

    await this.checkinsRepository.save(checkin)

    return { checkin };
  }
}