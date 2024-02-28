"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/http/controllers/gyms/fetch-gyms.ts
var fetch_gyms_exports = {};
__export(fetch_gyms_exports, {
  fetchGyms: () => fetchGyms
});
module.exports = __toCommonJS(fetch_gyms_exports);
var import_zod2 = require("zod");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "test", "production"]).default("dev"),
  PORT: import_zod.z.coerce.number().default(3333),
  JWT_SECRET: import_zod.z.string()
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables.", _env.error.format());
  throw new Error("Invalid environment variables.");
}
var env = _env.data;

// src/services/prisma.ts
var import_client = require("@prisma/client");
var prismaClient = new import_client.PrismaClient({
  log: env.NODE_ENV === "dev" ? ["query"] : []
});

// src/repositories/prisma/prisma-gyms-repository.ts
var PrismaGymsRepository = class {
  constructor() {
    this.items = [];
  }
  async create(data) {
    const gym = await prismaClient.gym.create({
      data
    });
    return gym;
  }
  async findById(id) {
    const gym = await prismaClient.gym.findUnique({
      where: {
        id
      }
    });
    return gym;
  }
  async findMany(query, page) {
    const gyms = await prismaClient.gym.findMany({
      where: {
        name: {
          contains: query
        }
      },
      take: 20,
      skip: (page - 1) * 20
    });
    return gyms;
  }
  async findManyNearby({ userLatitude, userLongitude }) {
    const gyms = await prismaClient.$queryRaw`
      SELECT * FROM gyms
      WHERE ( 6371 * acos( cos( radians(${userLatitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${userLongitude}) ) + sin( radians(${userLatitude}) ) * sin( radians( latitude ) ) ) ) <= 10
    `;
    return gyms;
  }
};

// src/use-cases/fetch-gyms.ts
var FetchGymsUseCase = class {
  constructor(gymsRepository) {
    this.gymsRepository = gymsRepository;
  }
  async execute({ query, page }) {
    const gyms = await this.gymsRepository.findMany(query, page);
    return { gyms };
  }
};

// src/use-cases/factories/make-fetch-gyms-use-case.ts
function makeFetchGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository();
  const useCase = new FetchGymsUseCase(gymsRepository);
  return useCase;
}

// src/http/controllers/gyms/fetch-gyms.ts
async function fetchGyms(request, reply) {
  const searchGymsQuerySchema = import_zod2.z.object({
    q: import_zod2.z.string(),
    page: import_zod2.z.coerce.number().min(1).default(1)
  });
  const { q, page } = searchGymsQuerySchema.parse(request.body);
  const searchGymsUseCase = makeFetchGymsUseCase();
  const { gyms } = await searchGymsUseCase.execute({
    query: q,
    page
  });
  return reply.status(200).send({
    gyms
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fetchGyms
});
