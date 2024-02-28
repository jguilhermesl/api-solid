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

// src/http/controllers/gyms/routes.ts
var routes_exports = {};
__export(routes_exports, {
  gymsRoutes: () => gymsRoutes
});
module.exports = __toCommonJS(routes_exports);

// src/http/middlewares/verify-jwt.ts
var verifyJWT = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      message: "Unauthorized."
    });
  }
};

// src/http/controllers/gyms/fetch-gyms.ts
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

// src/http/controllers/gyms/fetch-nearby-gyms.ts
var import_zod3 = require("zod");

// src/use-cases/fetch-nearby-gyms.ts
var FetchNearbyGymsUseCase = class {
  constructor(gymsRepository) {
    this.gymsRepository = gymsRepository;
  }
  async execute({ userLatitude, userLongitude }) {
    const gyms = await this.gymsRepository.findManyNearby({ userLatitude, userLongitude });
    return { gyms };
  }
};

// src/use-cases/factories/make-fetch-nearby-gyms-use-case.ts
function makeFetchNearbyGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository();
  const useCase = new FetchNearbyGymsUseCase(gymsRepository);
  return useCase;
}

// src/http/controllers/gyms/fetch-nearby-gyms.ts
async function fetchNearbyGyms(request, reply) {
  const nearbyGymsQuerySchema = import_zod3.z.object({
    latitude: import_zod3.z.coerce.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod3.z.coerce.number().refine((value) => {
      return Math.abs(value) <= 180;
    })
  });
  console.log(request.query);
  const { latitude, longitude } = nearbyGymsQuerySchema.parse(request.query);
  const fetchNearbyGymsUseCase = makeFetchNearbyGymsUseCase();
  const { gyms } = await fetchNearbyGymsUseCase.execute({
    userLatitude: latitude,
    userLongitude: longitude
  });
  return reply.status(200).send({
    gyms
  });
}

// src/use-cases/create-gym.ts
var CreateGymUseCase = class {
  constructor(gymsRepository) {
    this.gymsRepository = gymsRepository;
  }
  async execute({ name, description, phone, latitude, longitude }) {
    const gym = await this.gymsRepository.create({
      name,
      description,
      phone,
      latitude,
      longitude
    });
    return { gym };
  }
};

// src/use-cases/factories/make-create-gym-use-case.ts
function makeCreateGymUseCase() {
  const gymsRepository = new PrismaGymsRepository();
  const useCase = new CreateGymUseCase(gymsRepository);
  return useCase;
}

// src/http/controllers/gyms/create-gym.ts
var import_zod4 = require("zod");
async function createGym(request, reply) {
  const createGymBodySchema = import_zod4.z.object({
    name: import_zod4.z.string(),
    description: import_zod4.z.string().nullable(),
    phone: import_zod4.z.string().nullable(),
    latitude: import_zod4.z.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod4.z.number().refine((value) => {
      return Math.abs(value) <= 180;
    })
  });
  const { name, description, phone, latitude, longitude } = createGymBodySchema.parse(request.body);
  const createGymUseCase = makeCreateGymUseCase();
  await createGymUseCase.execute({
    name,
    description,
    phone,
    latitude,
    longitude
  });
  return reply.status(201).send();
}

// src/http/controllers/gyms/routes.ts
async function gymsRoutes(app) {
  app.addHook("onRequest", verifyJWT);
  app.get("/gyms/search", fetchGyms);
  app.get("/gyms/nearby", fetchNearbyGyms);
  app.post("/gyms", createGym);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  gymsRoutes
});
