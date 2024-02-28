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

// src/http/controllers/checkins/routes.ts
var routes_exports = {};
__export(routes_exports, {
  checkInsRoutes: () => checkInsRoutes
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

// src/http/controllers/checkins/create.ts
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

// src/repositories/prisma/prisma-checkins-repository.ts
var dayjs = require("dayjs");
var PrismaCheckInsRepository = class {
  async create(data) {
    const checkin = await prismaClient.checkIn.create({
      data
    });
    return checkin;
  }
  async findByUserIdOnDate(userId, date) {
    const startOfTheDay = dayjs(date).startOf("date");
    const endOfTheDay = dayjs(date).endOf("date");
    const checkIn = await prismaClient.checkIn.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfTheDay.toDate(),
          lte: endOfTheDay.toDate()
        }
      }
    });
    return checkIn;
  }
  async findByUserId(userId, page) {
    const checkins = await prismaClient.checkIn.findMany({
      where: {
        id: userId
      },
      take: 20,
      skip: (page - 1) * 20
    });
    return checkins;
  }
  async findById(id) {
    const checkin = await prismaClient.checkIn.findUnique({
      where: {
        id
      }
    });
    if (!checkin) {
      return null;
    }
    return checkin;
  }
  async save(checkIn) {
    const checkin = await prismaClient.checkIn.update({
      where: {
        id: checkIn.id
      },
      data: checkIn
    });
    return checkin;
  }
};

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

// src/utils/get-distance-between-coordinates.ts
function getDistanceBetweenCoordinates(from, to) {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0;
  }
  const fromRadian = Math.PI * from.latitude / 180;
  const toRadian = Math.PI * to.latitude / 180;
  const theta = from.longitude - to.longitude;
  const radTheta = Math.PI * theta / 180;
  let dist = Math.sin(fromRadian) * Math.sin(toRadian) + Math.cos(fromRadian) * Math.cos(toRadian) * Math.cos(radTheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344;
  return dist;
}

// src/use-cases/errors/max-distance-error.ts
var MaxDistanceError = class extends Error {
  constructor() {
    super("Max distance reached.");
  }
};

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found.");
  }
};

// src/use-cases/checkin.ts
var CheckInUseCase = class {
  constructor(checkinsRepository, gymsRepository) {
    this.checkinsRepository = checkinsRepository;
    this.gymsRepository = gymsRepository;
  }
  async execute({ userId, gymId, userLatitude, userLongitude }) {
    const gym = await this.gymsRepository.findById(gymId);
    if (!gym) {
      throw new ResourceNotFoundError();
    }
    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      { latitude: Number(gym.latitude), longitude: Number(gym.longitude) }
    );
    const MAX_DISTANCE_IN_KILOMETERS = 0.1;
    if (distance > MAX_DISTANCE_IN_KILOMETERS) {
      throw new MaxDistanceError();
    }
    const checkInOnSameDay = await this.checkinsRepository.findByUserIdOnDate(
      userId,
      /* @__PURE__ */ new Date()
    );
    if (checkInOnSameDay) {
      throw new Error();
    }
    const checkin = await this.checkinsRepository.create({ userId, gymId });
    if (!checkin) {
      throw new ResourceNotFoundError();
    }
    return { checkin };
  }
};

// src/use-cases/factories/make-checkin-use-case.ts
function makeCheckInUseCase() {
  const checkinsRepository = new PrismaCheckInsRepository();
  const gymsRepository = new PrismaGymsRepository();
  const useCase = new CheckInUseCase(checkinsRepository, gymsRepository);
  return useCase;
}

// src/http/controllers/checkins/create.ts
async function create(request, reply) {
  const createCheckInParamsSchema = import_zod2.z.object({
    gymId: import_zod2.z.string().uuid()
  });
  const createCheckInBodySchema = import_zod2.z.object({
    latitude: import_zod2.z.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod2.z.number().refine((value) => {
      return Math.abs(value) <= 180;
    })
  });
  const { gymId } = createCheckInParamsSchema.parse(request.params);
  const { latitude, longitude } = createCheckInBodySchema.parse(request.body);
  const checkInUseCase = makeCheckInUseCase();
  await checkInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude
  });
  return reply.status(201).send();
}

// src/http/controllers/checkins/validate.ts
var import_zod3 = require("zod");

// src/use-cases/errors/late-checkin-validation-error.ts
var LateCheckinValidationError = class extends Error {
  constructor() {
    super("Late Checkin Validation Error.");
  }
};

// src/use-cases/validate-checkin.ts
var dayjs2 = require("dayjs");
var ValidateCheckInUseCase = class {
  constructor(checkinsRepository) {
    this.checkinsRepository = checkinsRepository;
  }
  async execute({ checkInId }) {
    const checkin = await this.checkinsRepository.findById(checkInId);
    if (!checkin) {
      throw new ResourceNotFoundError();
    }
    const DISTANCE_IN_MINUTES_FROM_CHECKIN_CREATION = dayjs2(/* @__PURE__ */ new Date()).diff(
      checkin.createdAt,
      "minutes"
    );
    if (DISTANCE_IN_MINUTES_FROM_CHECKIN_CREATION > 20) {
      throw new LateCheckinValidationError();
    }
    checkin.validatedAt = /* @__PURE__ */ new Date();
    await this.checkinsRepository.save(checkin);
    return { checkin };
  }
};

// src/use-cases/factories/make-validate-checkin-use-case.ts
function makeValidateCheckInUseCase() {
  const checkinsRepository = new PrismaCheckInsRepository();
  const useCase = new ValidateCheckInUseCase(checkinsRepository);
  return useCase;
}

// src/http/controllers/checkins/validate.ts
async function validate(request, reply) {
  const validateCheckInParamsSchema = import_zod3.z.object({
    checkInId: import_zod3.z.string().uuid()
  });
  const { checkInId } = validateCheckInParamsSchema.parse(request.params);
  const validateCheckInUseCase = makeValidateCheckInUseCase();
  await validateCheckInUseCase.execute({
    checkInId
  });
  return reply.status(204).send();
}

// src/http/controllers/checkins/history.ts
var import_zod4 = require("zod");

// src/use-cases/fetch-user-checkins-history.ts
var FetchUserCheckInsHistoryUseCase = class {
  constructor(checkinsRepository) {
    this.checkinsRepository = checkinsRepository;
  }
  async execute({ userId, page }) {
    const checkins = await this.checkinsRepository.findByUserId(userId, page);
    return { checkins };
  }
};

// src/use-cases/factories/make-fetch-user-checkins-history.ts
function makeFetchUserCheckInsHistoryUseCase() {
  const checkinsRepository = new PrismaCheckInsRepository();
  const useCase = new FetchUserCheckInsHistoryUseCase(checkinsRepository);
  return useCase;
}

// src/http/controllers/checkins/history.ts
async function history(request, reply) {
  const checkInHistoryQuerySchema = import_zod4.z.object({
    page: import_zod4.z.coerce.number().min(1).default(1)
  });
  const { page } = checkInHistoryQuerySchema.parse(request.query);
  const fetchUserCheckInsHistoryUseCase = makeFetchUserCheckInsHistoryUseCase();
  const { checkins } = await fetchUserCheckInsHistoryUseCase.execute({
    page,
    userId: request.user.sub
  });
  return reply.status(200).send({
    checkins
  });
}

// src/http/controllers/checkins/routes.ts
async function checkInsRoutes(app) {
  app.addHook("onRequest", verifyJWT);
  app.get("/check-ins/history", history);
  app.post("/gyms/:gymId/check-ins", create);
  app.patch("/check-ins/:checkInId/validate", validate);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkInsRoutes
});
