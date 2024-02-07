import { CheckIn, Prisma } from '@prisma/client';

export interface CheckInsRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>,
  findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>,
  findByUserId(userId: string, page: number): Promise<CheckIn[]>,
  findById(id: string): Promise<CheckIn | null>,
  save(checkIn: CheckIn): Promise<CheckIn>
}