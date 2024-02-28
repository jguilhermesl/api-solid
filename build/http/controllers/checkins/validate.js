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

// src/http/controllers/checkins/validate.ts
var validate_exports = {};
__export(validate_exports, {
  validate: () => validate
});
module.exports = __toCommonJS(validate_exports);
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

// src/use-cases/errors/late-checkin-validation-error.ts
var LateCheckinValidationError = class extends Error {
  constructor() {
    super("Late Checkin Validation Error.");
  }
};

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found.");
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
  const validateCheckInParamsSchema = import_zod2.z.object({
    checkInId: import_zod2.z.string().uuid()
  });
  const { checkInId } = validateCheckInParamsSchema.parse(request.params);
  const validateCheckInUseCase = makeValidateCheckInUseCase();
  await validateCheckInUseCase.execute({
    checkInId
  });
  return reply.status(204).send();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validate
});
