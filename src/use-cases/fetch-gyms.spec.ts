import { InMemoryGymsRepository } from './../repositories/in-memory/in-memory-gyms-repository';
import { beforeEach, describe, expect, it } from "vitest"
import { FetchGymsUseCase } from "./fetch-gyms";

let gymsRepository: InMemoryGymsRepository;
let sut: FetchGymsUseCase;

describe('Fetch Gyms Use Case', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new FetchGymsUseCase(gymsRepository)
  })

  it('should be able to fetch all gyms', async () => {
    const gym01 = await gymsRepository.create({
      name: 'JS Dev',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    const gym02 = await gymsRepository.create({
      name: 'Dev Fit',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    const gym03 = await gymsRepository.create({
      name: 'Ciafit',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    const { gyms } = await sut.execute({ query: "", page: 1 })

    expect(gyms).toHaveLength(3)
    expect(gyms).toEqual([
      expect.objectContaining({ id: gym01.id }),
      expect.objectContaining({ id: gym02.id }),
      expect.objectContaining({ id: gym03.id }),
    ])
  })

  it('should be able to search gyms', async () => {
    const gym01 = await gymsRepository.create({
      name: 'JS Dev',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    const gym02 = await gymsRepository.create({
      name: 'Dev Fit',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    await gymsRepository.create({
      name: 'Ciafit',
      description: null,
      phone: null,
      latitude: -22.33333,
      longitude: 33.445555
    })

    const { gyms } = await sut.execute({ query: "Dev", page: 1 })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ id: gym01.id }),
      expect.objectContaining({ id: gym02.id }),
    ])
  })

  it('should be able to fetch paginated user checkins history', async () => {
    const USER_ID = 'user-01'

    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        name: `gym-${i}`,
        description: null,
        phone: null,
        latitude: -22.33333,
        longitude: 33.445555
      })
    }

    const { gyms } = await sut.execute({ query: "", page: 2 })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ name: 'gym-21' }),
      expect.objectContaining({ name: 'gym-22' }),
    ])
  })
})