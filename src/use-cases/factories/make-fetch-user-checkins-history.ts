import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-checkins-repository";
import { FetchUserCheckInsHistoryUseCase } from "../fetch-user-checkins-history";

export function makeFetchUserCheckInsHistoryUseCase() {
  const checkinsRepository = new PrismaCheckInsRepository();
  const useCase = new FetchUserCheckInsHistoryUseCase(checkinsRepository);

  return useCase;
}