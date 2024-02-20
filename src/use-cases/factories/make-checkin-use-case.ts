import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-checkins-repository";
import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository";
import { CheckInUseCase } from "../checkin";

export function makeCheckInUseCase() {
  const checkinsRepository = new PrismaCheckInsRepository();
  const gymsRepository = new PrismaGymsRepository();
  const useCase = new CheckInUseCase(checkinsRepository, gymsRepository);

  return useCase;
}