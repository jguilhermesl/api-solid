import { InMemoryGymsRepository } from './../repositories/in-memory/in-memory-gyms-repository';
import { InMemoryCheckInsRepository } from './../repositories/in-memory/in-memory-checkins-repository';
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CheckInUseCase } from './checkin';
import { Gym } from '@prisma/client';

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;
let gym: Gym;

describe('Checkin Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    gym = await gymsRepository.create({
      name: 'JS Gym',
      description: "",
      phone: "",
      latitude: -8.035677,
      longitude: -34.935173,
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkin } = await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -8.035677,
      userLongitude: -34.935173,
    });

    expect(checkin.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -8.035677,
      userLongitude: -34.935173,
    });

    await expect(() => sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -8.035677,
      userLongitude: -34.935173,
    })).rejects.toBeInstanceOf(Error)
  })

  it('should be able to check in twice in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -8.035677,
      userLongitude: -34.935173,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkin } = await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -8.035677,
      userLongitude: -34.935173,
    })

    expect(checkin.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.create({
      name: 'JS Gym',
      description: "",
      phone: "",
      latitude: -8.035677,
      longitude: -34.935173,
    })

    await expect(() => sut.execute({
      gymId: 'gym-02',
      userId: 'user-01',
      userLatitude: -9.035677,
      userLongitude: -32.935173,
    })).rejects.toBeInstanceOf(Error)
  })

})