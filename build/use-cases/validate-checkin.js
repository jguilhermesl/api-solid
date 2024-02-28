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

// src/use-cases/validate-checkin.ts
var validate_checkin_exports = {};
__export(validate_checkin_exports, {
  ValidateCheckInUseCase: () => ValidateCheckInUseCase
});
module.exports = __toCommonJS(validate_checkin_exports);

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
var dayjs = require("dayjs");
var ValidateCheckInUseCase = class {
  constructor(checkinsRepository) {
    this.checkinsRepository = checkinsRepository;
  }
  async execute({ checkInId }) {
    const checkin = await this.checkinsRepository.findById(checkInId);
    if (!checkin) {
      throw new ResourceNotFoundError();
    }
    const DISTANCE_IN_MINUTES_FROM_CHECKIN_CREATION = dayjs(/* @__PURE__ */ new Date()).diff(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ValidateCheckInUseCase
});
