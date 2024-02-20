import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository";
import { FetchGymsUseCase } from "../fetch-gyms";

export function makeFetchGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository();
  const useCase = new FetchGymsUseCase(gymsRepository);

  return useCase;
}