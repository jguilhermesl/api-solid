import { beforeEach, describe, expect, it } from "vitest"
import { hash } from "bcryptjs";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-checkins-repository";
import { FetchUserCheckInsHistoryUseCase } from "./fetch-user-checkins-history";

let checkinsRepository: InMemoryCheckInsRepository;
let sut: FetchUserCheckInsHistoryUseCase;

describe('Fetch User Checkins History Use Case', () => {
  beforeEach(() => {
    checkinsRepository = new InMemoryCheckInsRepository()
    sut = new FetchUserCheckInsHistoryUseCase(checkinsRepository)
  })

  it('should be able to fetch user checkins history', async () => {
    const USER_ID = 'user-01'

    await checkinsRepository.create({
      gymId: 'gym-01',
      userId: USER_ID
    })

    await checkinsRepository.create({
      gymId: 'gym-02',
      userId: USER_ID
    })

    const { checkins } = await sut.execute({ userId: USER_ID, page: 1 })

    expect(checkins).toHaveLength(2)
    expect(checkins).toEqual([
      expect.objectContaining({ gymId: 'gym-01' }),
      expect.objectContaining({ gymId: 'gym-02' }),
    ])
  })

  it('should be able to fetch paginated user checkins history', async () => {
    const USER_ID = 'user-01'

    for (let i = 1; i <= 22; i++) {
      await checkinsRepository.create({
        gymId: `gym-${i}`,
        userId: USER_ID
      })
    }

    const { checkins } = await sut.execute({ userId: USER_ID, page: 2 })

    expect(checkins).toHaveLength(2)
    expect(checkins).toEqual([
      expect.objectContaining({ gymId: 'gym-21' }),
      expect.objectContaining({ gymId: 'gym-22' }),
    ])
  })
})