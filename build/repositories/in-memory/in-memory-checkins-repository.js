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

// src/repositories/in-memory/in-memory-checkins-repository.ts
var in_memory_checkins_repository_exports = {};
__export(in_memory_checkins_repository_exports, {
  InMemoryCheckInsRepository: () => InMemoryCheckInsRepository
});
module.exports = __toCommonJS(in_memory_checkins_repository_exports);
var import_node_crypto = require("crypto");
var dayjs = require("dayjs");
var InMemoryCheckInsRepository = class {
  constructor() {
    this.items = [];
  }
  async create(data) {
    const checkIn = {
      id: (0, import_node_crypto.randomUUID)(),
      userId: data.userId,
      gymId: data.gymId,
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.items.push(checkIn);
    return checkIn;
  }
  async findByUserIdOnDate(userId, date) {
    const startOfTheDay = dayjs(date).startOf("date");
    const endOfTheDay = dayjs(date).endOf("date");
    const checkinOnSameDate = this.items.find((checkIn) => {
      const checkInDate = dayjs(checkIn.createdAt);
      const isOnSameDate = checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay);
      return checkIn.userId === userId && isOnSameDate;
    });
    if (!checkinOnSameDate) {
      return null;
    }
    return checkinOnSameDate;
  }
  async findByUserId(userId, page) {
    return this.items.filter((checkin) => checkin.userId === userId).slice((page - 1) * 20, page * 20);
  }
  async findById(id) {
    const checkin = this.items.find((item) => item.id === id);
    if (!checkin) {
      return null;
    }
    return checkin;
  }
  async save(checkIn) {
    const checkInIndex = this.items.findIndex((item) => item.id === checkIn.id);
    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn;
    }
    return checkIn;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryCheckInsRepository
});
