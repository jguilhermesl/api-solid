import { CreateGymUseCase } from './create-gym';
import { beforeEach, describe, expect, it } from "vitest"
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository';


describe('Create Gym Use Case', () => {
  let gymsRepository: InMemoryGymsRepository;
  let createGymUseCase: CreateGymUseCase;

  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    createGymUseCase = new CreateGymUseCase(gymsRepository)
  })

  it('should be able to create a gym', async () => {
    const { gym } = await createGymUseCase.execute({
      name: 'JS Dev',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    expect(gym.id).toEqual(expect.any(String))
  })
})