"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);

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

// src/app.ts
var import_fastify = __toESM(require("fastify"));
var import_zod10 = require("zod");
var import_jwt = __toESM(require("@fastify/jwt"));
var import_cookie = __toESM(require("@fastify/cookie"));

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

// src/http/controllers/users/authenticate.ts
var import_zod2 = require("zod");

// src/use-cases/errors/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials.");
  }
};

// src/services/prisma.ts
var import_client = require("@prisma/client");
var prismaClient = new import_client.PrismaClient({
  log: env.NODE_ENV === "dev" ? ["query"] : []
});

// src/repositories/prisma/prisma-users-repository.ts
var PrismaUsersRepository = class {
  async create(data) {
    const user = await prismaClient.user.create({
      data
    });
    return user;
  }
  async findById(id) {
    const user = await prismaClient.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }
  async findByEmail(email) {
    const user = await prismaClient.user.findUnique({
      where: {
        email
      }
    });
    return user;
  }
};

// src/use-cases/authenticate.ts
var import_bcryptjs = require("bcryptjs");
var AuthenticateUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({ email, password }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const doesPasswordMatches = await (0, import_bcryptjs.compare)(password, user.passwordHash);
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }
    return { user };
  }
};

// src/use-cases/factories/make-authenticate-use-case.ts
function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const authenticateUseCase = new AuthenticateUseCase(usersRepository);
  return authenticateUseCase;
}

// src/http/controllers/users/authenticate.ts
async function authenticate(request, reply) {
  const authenticateBodySchema = import_zod2.z.object({
    email: import_zod2.z.string().email(),
    password: import_zod2.z.string().min(6)
  });
  const { email, password } = authenticateBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUseCase();
    const { user } = await authenticateUseCase.execute({ email, password });
    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id
        }
      }
    );
    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
          expiresIn: "7d"
        }
      }
    );
    return reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: true,
      // HTTPs
      sameSite: true,
      httpOnly: true
    }).status(200).send({
      token
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({
        message: err.message
      });
    }
    throw err;
  }
}

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found.");
  }
};

// src/use-cases/get-user-profile.ts
var GetUserProfileUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({ userId }) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }
    return { user };
  }
};

// src/use-cases/factories/make-get-user-profile-use-case.ts
function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const useCase = new GetUserProfileUseCase(usersRepository);
  return useCase;
}

// src/http/controllers/users/profile.ts
async function profile(request, reply) {
  const getUserProfile = makeGetUserProfileUseCase();
  const { user } = await getUserProfile.execute({
    userId: request.user.sub
  });
  return reply.status(200).send({
    user
  });
}

// src/use-cases/errors/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists.");
  }
};

// src/http/controllers/users/register.ts
var import_zod3 = require("zod");

// src/use-cases/register.ts
var import_bcryptjs2 = require("bcryptjs");
var RegisterUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({ name, email, password }) {
    const passwordHash = await (0, import_bcryptjs2.hash)(password, 6);
    const userWithSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }
    const user = await this.usersRepository.create({
      name,
      email,
      passwordHash
    });
    return { user };
  }
};

// src/use-cases/factories/make-register-use-case.ts
function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const registerUseCase = new RegisterUseCase(usersRepository);
  return registerUseCase;
}

// src/http/controllers/users/register.ts
async function register(request, reply) {
  const registerBodySchema = import_zod3.z.object({
    name: import_zod3.z.string(),
    email: import_zod3.z.string().email(),
    password: import_zod3.z.string().min(6)
  });
  const { name, email, password } = registerBodySchema.parse(request.body);
  try {
    const registerUseCase = makeRegisterUseCase();
    await registerUseCase.execute({ name, email, password });
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({
        message: err.message
      });
    }
    throw err;
  }
  return reply.status(201).send();
}

// src/http/controllers/users/refresh.ts
async function refresh(request, reply) {
  await request.jwtVerify({ onlyCookie: true });
  const token = await reply.jwtSign(
    {},
    {
      sign: {
        sub: request.user.sub
      }
    }
  );
  const refreshToken = await reply.jwtSign(
    {},
    {
      sign: {
        sub: request.user.sub,
        expiresIn: "7d"
      }
    }
  );
  return reply.setCookie("refreshToken", refreshToken, {
    path: "/",
    secure: true,
    // HTTPs
    sameSite: true,
    httpOnly: true
  }).status(200).send({
    token
  });
}

// src/http/controllers/users/routes.ts
async function usersRoutes(app2) {
  app2.post("/users", register);
  app2.post("/sessions", authenticate);
  app2.patch("/token/refresh", refresh);
  app2.get("/me", { onRequest: [verifyJWT] }, profile);
}

// src/http/controllers/gyms/fetch-gyms.ts
var import_zod4 = require("zod");

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
  const searchGymsQuerySchema = import_zod4.z.object({
    q: import_zod4.z.string(),
    page: import_zod4.z.coerce.number().min(1).default(1)
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
var import_zod5 = require("zod");

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
  const nearbyGymsQuerySchema = import_zod5.z.object({
    latitude: import_zod5.z.coerce.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod5.z.coerce.number().refine((value) => {
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
var import_zod6 = require("zod");
async function createGym(request, reply) {
  const createGymBodySchema = import_zod6.z.object({
    name: import_zod6.z.string(),
    description: import_zod6.z.string().nullable(),
    phone: import_zod6.z.string().nullable(),
    latitude: import_zod6.z.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod6.z.number().refine((value) => {
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
async function gymsRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/gyms/search", fetchGyms);
  app2.get("/gyms/nearby", fetchNearbyGyms);
  app2.post("/gyms", createGym);
}

// src/http/controllers/checkins/create.ts
var import_zod7 = require("zod");

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
  const createCheckInParamsSchema = import_zod7.z.object({
    gymId: import_zod7.z.string().uuid()
  });
  const createCheckInBodySchema = import_zod7.z.object({
    latitude: import_zod7.z.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod7.z.number().refine((value) => {
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
var import_zod8 = require("zod");

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
  const validateCheckInParamsSchema = import_zod8.z.object({
    checkInId: import_zod8.z.string().uuid()
  });
  const { checkInId } = validateCheckInParamsSchema.parse(request.params);
  const validateCheckInUseCase = makeValidateCheckInUseCase();
  await validateCheckInUseCase.execute({
    checkInId
  });
  return reply.status(204).send();
}

// src/http/controllers/checkins/history.ts
var import_zod9 = require("zod");

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
  const checkInHistoryQuerySchema = import_zod9.z.object({
    page: import_zod9.z.coerce.number().min(1).default(1)
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
async function checkInsRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/check-ins/history", history);
  app2.post("/gyms/:gymId/check-ins", create);
  app2.patch("/check-ins/:checkInId/validate", validate);
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_jwt.default, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false
  },
  sign: {
    expiresIn: "10m"
  }
});
app.register(import_cookie.default);
app.register(usersRoutes);
app.register(gymsRoutes);
app.register(checkInsRoutes);
app.setErrorHandler((error, _, reply) => {
  if (error instanceof import_zod10.ZodError) {
    return reply.status(400).send({
      message: "Validation error.",
      issues: error.format()
    });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
  }
  return reply.status(500).send({
    message: "Internal server error."
  });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
