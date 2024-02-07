import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository';
import { beforeEach, describe, expect, it } from "vitest"
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms';

let gymsRepository: InMemoryGymsRepository;
let sut: FetchNearbyGymsUseCase;

describe('Fetch Nearby Gyms Use Case', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  it('should be able to fetch nearby gyms', async () => {
    const gym01 = await gymsRepository.create({
      name: 'JS Dev',
      description: null,
      phone: null,
      latitude: -8.0462693,
      longitude: -34.8909071
    })

    const gym02 = await gymsRepository.create({
      name: 'Dev Fit',
      description: null,
      phone: null,
      latitude: -8.0455419,
      longitude: -34.8786111
    })

    await gymsRepository.create({
      name: 'Ciafit',
      description: null,
      phone: null,
      latitude: -8.3117355,
      longitude: -34.9555165
    })

    const { gyms } = await sut.execute({
      userLatitude: -8.035677,
      userLongitude: -34.935173,
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ id: gym01.id }),
      expect.objectContaining({ id: gym02.id }),
    ])
  })
})