import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-checkins-repository';
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { LateCheckinValidationError } from './errors/late-checkin-validation-error';
import { ValidateCheckInUseCase } from './validate-checkin';

let checkInsRepository: InMemoryCheckInsRepository;
let sut: ValidateCheckInUseCase;

describe('Validate Checkin Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new ValidateCheckInUseCase(checkInsRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to validate check in', async () => {
    const createdCheckin = await checkInsRepository.create({
      gymId: "gym-01",
      userId: "user-01"
    })

    const { checkin: validatedCheckin } = await sut.execute({
      checkInId: createdCheckin.id
    });

    expect(validatedCheckin.validatedAt).toEqual(expect.any(Date))
    expect(checkInsRepository.items[0].validatedAt).toEqual(expect.any(Date))
  })

  it('should not be able to validate check after 20 minutes of its creation', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40))

    const createdCheckin = await checkInsRepository.create({
      gymId: "gym-01",
      userId: "user-01"
    })

    const TWENTY_ONE_MINUTES_IN_MS = 1000 * 60 * 21

    vi.advanceTimersByTime(TWENTY_ONE_MINUTES_IN_MS)


    await expect(() => sut.execute({
      checkInId: createdCheckin.id
    })).rejects.toBeInstanceOf(LateCheckinValidationError)
  })

})